// services/accounts/index.js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync } from 'fs';
import express from 'express';
import cors from 'cors';
import { applyMiddleware } from 'graphql-middleware';
import { permissions } from '../../infrastructure/permissions.js'; // Adjust the import path as necessary
import {authenticate} from '../../infrastructure/auth.js'

import gql from 'graphql-tag';
import resolvers from './resolvers.js';
import AccountsAPI from './datasources/accounts.js';

const app = express();
app.use(express.json());

app.use(authenticate);

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4011'],
    })
  );
}

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
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
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (error) {
    console.error(error);
  }
}

startApolloServer();
