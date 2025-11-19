import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeListingContainer from '../services/DB/initListingContainer.js';
import { GraphQLError } from 'graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import { decodeToken } from '../infrastructure/middleware/auth.js';
// import LocationService from '../services/locationService.js';

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const startApolloServer = async () => {
  const mysqlContainer = await initializeListingContainer({ services: [] });
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors({ origin: '*', methods: ['GET','POST'], allowedHeaders: ['Content-Type','Authorization'] }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.split(' ')[1] || '';
        const userId = decodeToken(token);
        // const user = userId ? await mongoContainer.resolve('userService').getUserById(userId) : null;

        return {
          token,
          userId,
       
          dataSources: {
            listingService: mysqlContainer.resolve('listingService'),
            locationService: mysqlContainer.resolve('locationService'),
            amenityService: mysqlContainer.resolve('amenityService'),
          },
        };
      }
    })
  );

  httpServer.listen({ port: 4040 }, () =>
    console.log('Server is running on http://localhost:4040/graphql')
  );
};

startApolloServer();