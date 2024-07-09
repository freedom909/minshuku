import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import axios from 'axios';
import gql from 'graphql-tag';
import express from 'express';
import { AuthenticationError } from '../infrastructure/utils/errors.js';
import http from 'http';
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
import resolvers from './resolvers.js';
import bookingService from '../infrastructure/services/bookingService.js';
import ListingService from '../infrastructure/services/listingService.js';
import userService from '../infrastructure/services/userService.js';
import { initializeContainer, container } from '../infrastructure/DB/container.js';
import UserService from '../infrastructure/services/userService.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import router from './router.js';


async function startApolloServer() {
  try {
    await initializeContainer();

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
                await container.resolve('pool').client.close();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        user: req.headers.user || null,
        dataSources: {        
          listingService: container.resolve('listingService'),
          bookingService: container.resolve('bookingService'),
          userService: container.resolve('userService'),
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
            listingService: container.resolve('listingService'),
            bookingService: container.resolve('bookingService'),
            userService: container.resolve('userService'),
          }
        })
      })
    );
    // Use the router
    // app.use(router);
    await new Promise((resolve) => httpServer.listen({ port: 4010 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4010/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startApolloServer();

