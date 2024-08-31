
<<<<<<< HEAD
import ListingService from '../infrastructure/services/listingService.js';

import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
=======
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import ListingService from '../infrastructure/services/listingService.js';
import BookingService from '../infrastructure/services/bookingService.js';
import BookingRepository from '../infrastructure/repositories/bookingRepository.js';
import {startStandaloneServer} from '@apollo/server/standalone';
import paymentRepository from '../infrastructure/repositories/paymentRepository.js';
import listingRepository from '../infrastructure/repositories/listingRepository.js';
>>>>>>> d5a7c2663de4fded6aadcab540dbc2b7276f7f65
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
<<<<<<< HEAD
 import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeListingContainer from '../infrastructure/DB/initListingContainer.js';
import sequelize from '../infrastructure/models/seq.js';
import resolvers from './resolvers.js';
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));


const startApolloServer = async () => {
    try {
      // Initialize the container
      const container = await initializeListingContainer({ services: [] });
  
      // Resolve the necessary dependencies
      const listingRepository = container.resolve('listingRepository');
      const sequelize = container.resolve('sequelize');
  
      // Initialize the ListingService
      let listingService;
      try {
        listingService = new ListingService({ listingRepository, sequelize });
        console.log('ListingService initialized successfully');
      } catch (error) {
        console.error('Error initializing ListingService:', error);
        throw new Error('Failed to initialize ListingService');
      }
  
      // Continue with the rest of the server setup
      const app = express();
      const httpServer = http.createServer(app);
  
      const server = new ApolloServer({
        schema: buildSubgraphSchema({ typeDefs, resolvers }),
        introspection: true,
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          {
            async serverWillStart() {
              return {
                async drainServer() {   
                  await container.resolve('mysqldb').end();
                }
              };
            }
          }
        ],
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: {
            listingService, // Use the initialized listingService here
          },
        }),
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
              listingService, // Pass the listingService into the context
            },
          }),
        })
      );
  
      httpServer.listen({ port: 4040 }, () =>
        console.log('Server is running on http://localhost:4040/graphql')
      );
  
    } catch (error) {
      console.error('Error starting Apollo Server:', error);
    }
  };
  
  startApolloServer();
  
=======
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import dbConfig from '../infrastructure/DB/dbconfig.js';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
dotenv.config();
(async () => {
    // Initialize MySQL and MongoDB connections
    try {
      const mysqlPool = await dbConfig.mysql();
      console.log('MySQL pool initialized');
  
      const mongoDb = await dbConfig.mongo();
      console.log('MongoDB connection initialized');
  
      // Create an instance of ApolloServer
      const server = new ApolloServer({
        schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
        context: async () => ({
            dataSources: {
              listingService: new ListingService({ mongoDb }),
              bookingService: new BookingService({ mysqlPool }),
            },
          }),
      });
  
      // Start the server
      const { url } = await startStandaloneServer(server, {
        listen: { port: 4040 },
      });
  
      console.log(`🚀 Server ready at ${url}`);
    } catch (error) {
      console.error('Failed to initialize database connections:', error);
      process.exit(1); // Exit the process with an error code
    }
  })();
>>>>>>> d5a7c2663de4fded6aadcab540dbc2b7276f7f65
