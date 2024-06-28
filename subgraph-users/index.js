import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import UsersAPI from './datasources/usersApi.js';
import resolvers from './resolvers.js';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { initializeServices } from '../infrastructure/services/initializeService.js'; // Adjust this import based on your services
import cors from 'cors';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function startApolloServer() {
  try {
    await client.connect();
    const db = client.db('air');
    const app = express();
    const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
    const httpServer = http.createServer(app);
    const usersAPI = new UsersAPI({ db });

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
      context: async ({ req }) => {
        // Assuming initializeServices() returns a userService, adjust accordingly if needed
        const { userService } = await initializeServices();
        return {
          token: req.headers.authorization || '',
          user: req.headers.user || null,
          dataSources: {
            usersAPI, // Ensure usersAPI is correctly set up
          },
        };
      },
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server) // Corrected middleware usage
    );

    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startApolloServer();
