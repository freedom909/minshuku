import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
import resolvers from './resolvers.js';
import UsersAPI from './datasources/userApi.js';
import { MongoClient } from 'mongodb';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { readFileSync } from 'fs';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer = http.createServer(app);
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
await client.connect();
const db = client.db('air');

const usersAPI = new UsersAPI({ db });

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  context: async ({ req }) => {
    return {
      token: req.headers.authorization || '',
      user: req.headers.user || null,
      dataSources: {
        usersAPI,
      },
    };
  },
});

await server.start();

app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      token: req.headers.authorization || '',
      dataSources: {
        usersAPI,
      },
    }),
  })
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);

