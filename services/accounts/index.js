import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { permissions } from '../../infrastructure/auth/permission.js';
import { authenticateJWT } from '../../infrastructure/auth/auth.js'; // Assuming authenticateJWT was defined and exported in auth.js
import router from './app.js';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import express from 'express';
import cors from 'cors';
import { applyMiddleware } from 'graphql-middleware';
import resolvers from './resolvers.js';
import AccountsAPI from './datasources/accountsApi.js';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const app = express();
app.use(express.json());
app.use(authenticateJWT); // Apply authentication middleware
app.use(router);

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4011']
    })
  );
}

const schema = buildSubgraphSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, permissions);

async function startApolloServer() {
  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    dataSources: () => ({
      accountsAPI: new AccountsAPI(),
    }),
    context: ({ req }) => ({
      user: req.user,
    }),
  });

  const port = 4011;
  const subgraphName = 'accounts';

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
      expressApp: app, // Attach Express app to Apollo Server
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (error) {
    console.error(error);
  }
}

startApolloServer();
