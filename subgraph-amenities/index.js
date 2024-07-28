// index.js
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import initializeAmenityContainer from '../infrastructure/DB/initAmenityContainer.js';

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  const container = await initializeAmenityContainer();

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    dataSources: () => ({
      listingService: container.resolve('listingService'),
      amenityService: container.resolve('amenityService'),
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
