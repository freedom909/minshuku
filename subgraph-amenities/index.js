import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import initializeAmenityContainer from '../services/DB/initAmenityContainer.js';

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', 'utf-8'));

const startServer = async () => {
  const container = await initializeAmenityContainer();
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req }) => ({
      locationId: req.body?.variables?.locationId || null,
      dataSources: {
        amenityService: container.resolve('amenityService'),
      },
    }),
  });

  await server.start();

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server)
  );

  httpServer.listen({ port: 4090 }, () => {
    console.log('🚀 Amenities Subgraph running at http://localhost:4090/graphql');
  });
};

startServer();
