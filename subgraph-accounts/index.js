import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import initMongoContainer from '../infrastructure/DB/initMongoContainer.js';
import initListingContainer from '../infrastructure/DB/initListingContainer.js';
import initCartContainer from '../infrastructure/DB/initCartContainer.js';
import initReviewContainer from '../infrastructure/DB/initReviewContainer.js';
import initProfileContainer from '../infrastructure/DB/initProfileContainer.js';
import initBookingContainer from '../infrastructure/DB/initBookingContainer.js';

import resolvers from './resolvers.js';

async function startApolloServer() {
  try {
    await initMongoContainer();

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
                await initListingContainer.resolve('db').close();
                await initBookingContainer.resolve('db').close();  // Ensure MongoDB client is closed properly
                await initCartContainer.resolve('db').close();  // Ensure MongoDB client is closed properly
                await initReviewContainer.resolve('mongodb').close();// Ensure MongoDB client is closed properly
                await initMongoContainer.resolve('mongodb').close();  // Ensure MongoDB client is closed properly
                await initProfileContainer.resolve('mongodb').close();  // Ensure MongoDB client is closed properly             
              }

            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        user: req.headers.user || null,
        dataSources: {
          accountService: container.resolve('accountService'),
          listingService: container.resolve('listingService'),
          bookingService: container.resolve('bookingService'),
          cartService: container.resolve('cartService'),
          reviewService: container.resolve('reviewService'),
          profileService: container.resolve('profileService')
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
            accountService: container.resolve('accountService'),
            listingService: container.resolve('listingService'),
            bookingService: container.resolve('bookingService'),
            cartService: container.resolve('cartService'),
            reviewService: container.resolve('reviewService'),
            profileService: container.resolve('profileService')
          }
        })
      })
    );
    await new Promise((resolve) => httpServer.listen({ port: 4001 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4001/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startApolloServer();
