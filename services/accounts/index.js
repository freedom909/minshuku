import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { permissions } from '../../infrastructure/auth/permission.js';
import { authenticateJWT } from '../../infrastructure/auth/auth.js';
import router from './app.js';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import express from 'express';
import cors from 'cors';
import { applyMiddleware } from 'graphql-middleware';
import resolvers from './graphql/resolvers.js';
import AccountsAPI from './datasources/accountsApi.js';
import BookingsAPI from './datasources/bookingsApi.js';
import initDataLoaders from './datasources/dataLoaders.js';

const typeDefs = gql(readFileSync('./graphql/schema.graphql', { encoding: 'utf-8' }));

const app = express();
app.use(express.json());
app.use(authenticateJWT);
app.use(router);

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4011']
    })
  );
}

const schema = buildSubgraphSchema({ typeDefs, resolvers });
// const schemaWithMiddleware = applyMiddleware(schema, permissions); // Apply permissions middleware

async function startApolloServer() {
  const server = new ApolloServer({
    schema: schema, // Use schema with middleware
    dataSources: () => ({
      accountsAPI: new AccountsAPI({ auth0 }),
      bookingsAPI: new BookingsAPI(),
    }),
    context: ({ req }) => {
      const user = req.headers.user ? JSON.parse(req.headers.user) : null;
      return { user, loaders: initDataLoaders() };
    },
  });

  const port = 4011;
  const subgraphName = 'accounts';

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
      expressApp: app,
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (error) {
    console.error(error);
  }
}

startApolloServer();
