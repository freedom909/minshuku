import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

import UserService from '../infrastructure/services/userService.js'; // Adjust this import based on your services
import resolvers from './resolvers.js';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeServices  from '../infrastructure/services/initService.js'; // Adjust this import based on your services
import cors from 'cors';
import UserRepository from '../infrastructure/repositories/userRepository.js'; // Adjust this import based
import dotenv from 'dotenv';
import connectToDB from '../infrastructure/DB/mysqlDB.js';
dotenv.config();


const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const client = new MongoClient(uri);

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const initializeContainer = async () => {
  const db = await connectToDB();
  const container = createContainer();
  container.register({
    db: asValue(db),
    listingRepository: asClass(ListingRepository).singleton(),
    listingService: asClass(ListingService).singleton()
  });
  return container;
};

const startApolloServer = async () => {
  try {
    const container = await initializeContainer();

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await container.resolve('db').end();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          listingService: container.resolve('listingService')
        }
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
          dataSources: {
            listingService: container.resolve('listingService')
          }
        })
      })
    );

    await new Promise((resolve) => httpServer.listen({ port: 4010 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4010/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
};
