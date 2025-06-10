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

import resolvers from './resolvers.js';
import  logger from '../infrastructure/utils/logger.js';
import  ReviewRepository from '../services/repositories/reviewRepository.js';

// Container initializers
import initializeListingContainer from '../services/DB/initListingContainer.js';
import initMongoContainer from '../services/DB/initMongoContainer.js';
import initializeReviewContainer from '../services/DB/initReviewContainer.js';

dotenv.config();

const schemaPath = path.join(process.cwd(), 'schema.graphql');
const typeDefs = gql(readFileSync(schemaPath, { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const mysqlContainer = await initializeListingContainer();
    console.log('✅ mysqlContainer keys:', Object.keys(mysqlContainer.registrations));

    const mongoContainer = await initMongoContainer();
    const neo4jContainer = await initializeReviewContainer();

    if (!mysqlContainer || !mongoContainer || !neo4jContainer) {
      throw new Error('One or more containers failed to initialize');
    }

    console.log('Review container keys:', Object.keys(neo4jContainer.registrations));
    console.log('Review repository:', neo4jContainer.resolve('reviewRepository'));
    console.log('Review service:', neo4jContainer.resolve('reviewService'));

    const app = express();
    const httpServer = http.createServer(app);

    //app.use(debugMiddleware);

    const schema = buildSubgraphSchema({ typeDefs, resolvers });

    const server = new ApolloServer({
      schema,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
      ],
      introspection: true,
    });

    await server.start();

    const buildContext = async ({ req }) => {
      try {
        const token = req.headers.authorization || '';
        console.log('Received token:', token);
    
        const reviewRepository = neo4jContainer?.resolve('reviewRepository');
        const reviewService = neo4jContainer?.resolve('reviewService');
        const listingService = mysqlContainer?.resolve('listingService');
        const bookingService = mysqlContainer?.resolve('bookingService');
    
        if (!reviewService || !reviewRepository || !listingService || !bookingService) {
          console.warn('⚠️ Some services are missing. Context will still be created.');
        }
    
        return {
          dataSources: {
            reviewRepository,
            reviewService,
            listingService,
            bookingService,
            userService: {
              localAuthService: mongoContainer?.resolve('localAuthService'),
              oauthService: mongoContainer?.resolve('oauthService'),
              tokenService: mongoContainer?.resolve('tokenService'),
            }
          },
          logger
        };
      } catch (error) {
        console.error('Error building context:', error);
        return {}; // 👈 return an empty context instead of throwing
      }
    };
    

    // 💥💥💥 Fix: provide context manually here
    app.use('/graphql', cors({
      origin: '*',
      credentials: true
    }), express.json(), expressMiddleware(server, {
      context: buildContext
    }));
    

    httpServer.listen({ port: 4080 }, () => {
      console.log(`🚀 Server ready at http://localhost:4080/graphql`);
    });

  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startApolloServer();