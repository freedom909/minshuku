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
import ListingService from '../infrastructure/services/listingService.js';
import { startStandaloneServer } from '@apollo/server/standalone';
import UserService from '../infrastructure/services/userService.js';
import AmenityService from '../infrastructure/services/amenityService.js';
import initMongoContainer from '../infrastructure/DB/initMongoContainer.js';
import getUserFromToken from '../infrastructure/auth/getUserFromToken.js';
import initializeAmenityContainer from '../infrastructure/DB/initAmenityContainer.js';

dotenv.config();
// Initialize AmenityService

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  const container = await initializeAmenityContainer();

  // Create Apollo Server instance
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    dataSources: () => ({
      listingService: container.resolve('listingService'),
      amenityService: container.resolve('amenityService'),
      // Add other data sources if any
    }),
    context: ({ req }) => {
      // Context setup if needed
    },
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4012 },
  });
  console.log(`🚀 Server ready at ${url}`);
};

startApolloServer();
