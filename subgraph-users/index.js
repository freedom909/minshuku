import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import initUserContainer from '../services/DB/initUserContainer.js'; // Your container initialization function
import { readFileSync } from 'fs';

import { gql } from 'graphql-tag';
import resolvers from './resolvers.js';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import OAuthService from '../services/userService/oauthService.js';
import dotenv from 'dotenv';
dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const createApolloServer = (container) => {
  return new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    introspection: true, // Ensure introspection is enabled
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: container.httpServer }),
      {
        async serverWillStart() {
          console.log('Server is starting...');
          return {
            async drainServer() {
              console.log('Draining server...');
              await container.resolve('mongodb').end(); // Ensure proper cleanup
            },
          };
        },
      },
    ],
  });
};

// 🔹 Express middleware context function
const createContext = async ({ req, container }) => {
  const token = req.headers.authorization || '';

  return {
    token,
    dataSources: {
      userService: {
        localAuthService: container.resolve('localAuthService'),
        oAuthService: container.resolve('oAuthService'),
        tokenService: container.resolve('tokenService'),
      },
    },
  };
};

// 🔹 Function to start Apollo Server
const startApolloServer = async () => {
  try {
    const container = await initUserContainer();
    const app = express();
    const httpServer = http.createServer(app);
    container.httpServer = httpServer; // Store HTTP server reference

    const server = createApolloServer(container);
    await server.start();

    app.use(
      '/graphql',
      cors({
        origin: "http://localhost:3000", // Allow frontend access
        credentials: true, // Allow cookies if authentication is needed
      }),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => createContext({ req, container }),
      })
    );

    httpServer.listen({ port: process.env.PORT || 4011 }, () =>
      console.log(`🚀 Server ready at http://localhost:${process.env.PORT || 4011}/graphql`)
    );
  } catch (error) {
    console.error('❌ Error starting Apollo Server:', error);
  }
};

startApolloServer();
