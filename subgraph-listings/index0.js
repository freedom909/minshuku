
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import ListingService from '../infrastructure/services/listingService.js';
import BookingService from '../infrastructure/services/bookingService.js';
import BookingRepository from '../infrastructure/repositories/bookingRepository.js';
import {startStandaloneServer} from '@apollo/server/standalone';
import paymentRepository from '../infrastructure/repositories/paymentRepository.js';
import listingRepository from '../infrastructure/repositories/listingRepository.js';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
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
