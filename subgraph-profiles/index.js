import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initMongoContainer from '../infrastructure/DB/initMongoContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import ProfileModel from '../infrastructure/models/profile.js';
import ProfileRepository from '../infrastructure/repositories/profileRepository.js';
import ProfileService from '../infrastructure/services/profileService';

// Container function to initialize the subgraph-profile
const initializeProfileSubgraph = () => {
    // Initialize repository
    const profileRepository = new ProfileRepository({ ProfileModel });
    
    // Initialize service
    const profileService = new ProfileService({ profileRepository });
    
    // Build federated schema
    const schema = buildSubgraphSchema({ typeDefs, resolvers });
    
    // Create Apollo Server instance with the federated schema
    const server = new ApolloServer({
      schema,
      context: () => ({
        dataSources,
      }),
    });
    
    return server;
  };

const server = initializeProfileSubgraph();

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
