import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { PrismaClient } from '@prisma/client';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { createContext } from '../../infrastructure/helpers/createContext.js';
import resolvers from './resolvers.js';
import BookingsAPI from './datasources/bookingsApi.js';
import PaymentsAPI from './datasources/paymentsApi.js';
import ListingsAPI from './datasources/listingsApi.js';
import errors from '../../infrastructure/utils/errors.js';
import http from 'http';
import cors from 'cors';
import express from 'express';

const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const prisma = new PrismaClient();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  context: ({ req }) => createContext({ req, prisma }),
  dataSources: () => ({
    bookingsAPI: new BookingsAPI(),
    paymentsAPI: new PaymentsAPI(),
    listingsAPI: new ListingsAPI(),
  }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4004 }, resolve));
console.log(`🚀 Server ready at http://localhost:4004/graphql`);
