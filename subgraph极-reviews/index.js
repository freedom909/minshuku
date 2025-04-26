import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import resolvers from './resolvers.js';
import { logger, debugMiddleware } from '../infrastructure/utils/logger.js';
import ReviewRepository from '../services/repositories/reviewRepository.js';
// Container initializers
import initializeListingContainer from '../services/DB/initListingContainer.js';
import initMongoContainer from '../services/DB/initMongoContainer.js';
import initializeReviewContainer from '../services/DB/initReviewContainer.js';

dotenv.config();

console.log('Neo4j environment variables:', {
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USER: process.env.NEO4J_USER,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD
});

const schemaPath = path.join(process.cwd(), 'schema.graphql');
const typeDefs = gql(readFileSync(schemaPath, { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    let mysqlContainer, mongoContainer, neo4jContainer;
    try {
      mysqlContainer = await initializeListingContainer();
    } catch (error) {
      console.error('Error initializing listing container:', error);
    }
    try {
      mongoContainer = await initMongoContainer();
    } catch (error) {
      console.error('Error initializing mongo container:', error);
    }
    try {
      neo4jContainer = await initializeReviewContainer();
    } catch (error) {
      console.error('Error initializing review container:', error);
    }

    console.log('Review container keys:', Object.keys(neo4jContainer.registrations));
    console.log('ReviewRepository instance:', neo4jContainer.resolve('reviewRepository'));
    console.log('ReviewService instance:', neo4jContainer.resolve('reviewService'));

    const app = express();
    const httpServer = http.createServer(app);

    app.use(debugMiddleware);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ type极Defs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                if (mysqlContainer?.resolve) await mysqlContainer.resolve('mysql')?.close();
                if (mongoContainer?.resolve) await mongoContainer.resolve('mongodb')?.close();
                if (neo4jContainer?.resolve) await neo4jContainer.resolve('neo4j')?.close();
              }
            };
          }
        }
      ],
      introspection: true,
      context: async ({ req }) => {
        try {
          const token = req.headers.authorization || '';
          
          // Resolve all required services
          const reviewRepository = neo4jContainer.resolve('reviewRepository');
          const reviewService = neo4jContainer.resolve('reviewService');
          const listingService = mysqlContainer.resolve('listingService');
          const bookingService = mysqlContainer.resolve('bookingService');
          const userService = {
            localAuthService: mongoContainer.resolve('localAuthService'),
            oAuthService: mongoContainer.resolve('oAuthService'),
            tokenService: mongoContainer.resolve('tokenService')
          };

          // Create dataSources object
          const dataSources = {
            reviewRepository,
            reviewService,
            listingService,
            bookingService,
            userService
          };

          // Return context with dataSources and other properties
          return {
            dataSources,
            token,
            logger,
            userId: req.user?.id
          };
        } catch (error) {
          console.error('Error creating context:', error);
          throw error;
        }
      }
    });

    await server.start();
    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          return server.context({ req });
        }
      })
    );

    httpServer.listen({ port: 4080 }, () => {
      console.log(`🚀 Server ready at http://localhost:4080/graphql`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startApolloServer();
