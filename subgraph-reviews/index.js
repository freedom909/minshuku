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
import { logger, debugMiddleware } from '../infrastructure/utils/logger.js';
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
    // Initialize containers
    const mysqlContainer = await initializeListingContainer();
    const mongoContainer = await initMongoContainer();
    const neo4jContainer = await initializeReviewContainer();
    console.log('Review container keys:', Object.keys(neo4jContainer.registrations));
    console.log('Review repository:', neo4jContainer.resolve('reviewRepository'));
    console.log('Review service:', neo4jContainer.resolve('reviewService'));

    const app = express();
    const httpServer = http.createServer(app);

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
      introspection: true,
      context: async ({ req }) => {
        const dataSources = {
          reviewRepository: neo4jContainer.resolve('reviewRepository'),
          reviewService: neo4jContainer.resolve('reviewService'),
          listingService: mysqlContainer.resolve('listingService'),
          bookingService: mysqlContainer.resolve('bookingService'),
          userService: {
            localAuthService: mongoContainer.resolve('localAuthService'),
            oAuthService: mongoContainer.resolve('oAuthService'),
            tokenService: mongoContainer.resolve('tokenService'),
          }
        };
        
        console.log('DataSources:', dataSources);
        
        const context = {
          token: req.headers.authorization || '',
          dataSources,
          logger
        };

        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Context created', { context });
        }

        return context;
      }
    });

    await server.start();

    app.use('/graphql', cors(), express.json(), expressMiddleware(server));
      
        
      

    httpServer.listen({ port: 4080 }, () => {
      console.log(`🚀 Server ready at http://localhost:4080/graphql`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
  }
};

startApolloServer();
