import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';


import { MongoClient } from 'mongodb';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { readFileSync } from 'fs';
import resolvers from './resolvers.js';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import express from 'express';
import http from 'http';
import initializeServices from '../infrastructure/services/initService.js'; // Adjust this import based
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer = http.createServer(app);
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);
await client.connect();
const db = client.db('air');



async function startApolloServer() {
  try {
    const { userService } = await initializeServices();
    const app = express();
    const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await closeConnection();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        user: req.headers.user || null,
        dataSources: { userService }
      })
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: { userService }
        })
      })
    );

    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}


startApolloServer();


