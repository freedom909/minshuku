import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import path from 'path';
import UserService from '../../infrastructure/services/userService.js';
import { expressMiddleware } from '@apollo/server/express4';
import UserRepository from '../../infrastructure/repositories/userRepository.js';
import resolvers from './resolvers.js';
import express from 'express';
import http from 'http';

import  initializeServices  from '../../infrastructure/services/initializeService.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/air';
const dbName = process.env.DB_NAME;
const dbClient = new MongoClient(mongoUrl);
await dbClient.connect();
const db = dbClient.db(dbName);
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);

const dataSources = () => ({
  userService,
});

const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  dataSources,
  context: ({ req }) => {
    const userId = req.headers.userid || null;
    return { userId };
  },
});

await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ userId: req.headers.userid || null }),
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4011 }, resolve));
console.log(`🚀 Server ready at http://localhost:4011/graphql`);
