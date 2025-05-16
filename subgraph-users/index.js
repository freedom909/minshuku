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
    // 确保等待 initUserContainer 执行完成
    const container = await initUserContainer(); 
    const app = express();
    const httpServer = http.createServer(app);
    container.httpServer = httpServer; // Store HTTP server reference

    const server = createApolloServer(container);
    await server.start();

    app.get('/health', (req, res) => {
      res.status(200).send('OK');
    });
    
    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => createContext({ req, container }),
        onHealthCheck: async () => {
          try {
            // Check MongoDB connection status using Mongoose
            const mongooseConn = mongoose.connection;
            if (mongooseConn.readyState !== 1) { // 1 means connected
              throw new Error('MongoDB connection not ready');
            }
            await mongooseConn.db.admin().ping(); // Ping using Mongoose
            return true; // Return true if the connection is healthy
          } catch (error) {
            console.error('Health check failed:', error);
            return false; // Return false if the connection is unhealthy
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