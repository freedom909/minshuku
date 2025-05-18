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
import mongoose from 'mongoose'; // Ensure mongoose is imported

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
              await mongoose.disconnect(); // Ensure proper cleanup with Mongoose
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
    req,
    token,
    dataSources: {
      userService: {
        localAuthService: container.resolve('localAuthService'),
        oauthService: container.resolve('oauthService'),
        tokenService: container.resolve('tokenService'),
      },
    },
  };
};

// 🔹 Function to start Apollo Server
const startApolloServer = async () => {
  try {
    // Ensure initUserContainer is executed
    const container = await initUserContainer();
    const app = express();

    // Apply express.json() middleware before Apollo Server middleware
    app.use(express.json());

    const httpServer = http.createServer(app);
    container.httpServer = httpServer; // Store HTTP server reference

    const server = createApolloServer(container);
    await server.start();

    app.use((req, res, next) => {
      console.log("Request Body:", req.body);
      next();
    });
    

    app.use(
      '/graphql',
      cors(),
      
      expressMiddleware(server, {
        context: async ({ req }) => createContext({ req, container }),
        onHealthCheck: async () => {
          try {
            const mongooseConn = mongoose.connection;
            if (mongooseConn.readyState !== 1) {
              throw new Error('MongoDB connection not ready');
            }
            await mongooseConn.db.admin().ping();
            return true;
          } catch (error) {
            console.error('Health check failed:', error);
            return false;
          }
        }
      })
    );
    

    httpServer.listen({ port: 4010 }, () =>
      console.log('🚀 Server ready at http://localhost:4010/graphql')
    );
  } catch (error) {
    console.error('❌ Error starting Apollo Server:', error);
  }
};

startApolloServer();