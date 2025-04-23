import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { createLogger, format, transports } from 'winston';

import initializeBookingContainer from '../services/DB/initBookingContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';

// Configure debug logger
const logger = createLogger({
  level: process.env.DEBUG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/debug.log' })
  ]
});

// Debug middleware
const debugMiddleware = (req, res, next) => {
  if (process.env.DEBUG_MODE === 'true') {
    logger.debug({
      message: 'Request received',
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body
    });
  }
  next();
};
import ListingService from '../services/listingService.js';
import BookingService from '../services/bookingService.js';
import LocalAuthService from '../services/userService/localAuthService.js';
import OAuthService from '../services/userService/oauthService.js';
import TokenService from '../services/userService/tokenService.js';
import initMongoContainer from '../services/DB/initMongoContainer.js';
import ReviewService from '../services/reviewService.js';

import initializeListingContainer from '../services/DB/initListingContainer.js';
import initializeReviewContainer from '../services/DB/initReviewContainer.js';
import ReviewRepository from '../services/repositories/reviewRepository.js';

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // Initialize MySQL and MongoDB containers
    const mysqlContainer = await initializeListingContainer({
      services: [ListingService, BookingService]
    });

    const mongoContainer = await initMongoContainer({
      services: [LocalAuthService, OAuthService, TokenService]
    });

    const neo4jContainer = await initializeReviewContainer({ services: [ReviewRepository] })

    const app = express();
    const httpServer = http.createServer(app);

    // Apply debug middleware
    app.use(debugMiddleware);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
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
      introspection: true,  // Enable introspection for GraphQL Playground
      context: async ({ req }) => {
        const context = {
          token: req.headers.authorization || '',
          dataSources: {
            reviewRepository: neo4jContainer.cradle.reviewRepository,
            bookingService: new BookingService(),
            listingService: new ListingService(),
            reviewService: new ReviewService()
          },
          logger
        };

        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Context created', { context });
        }

        return context;
      }
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server)
    );

    httpServer.listen({ port: 4080 }, () => {
      console.log(`🚀 Server ready at http://localhost:4080/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    // Cleanup resources if initialization fail
  }
};

startApolloServer();
