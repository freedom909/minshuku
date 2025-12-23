import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeAdminContainer from '../services/DB/initAdminContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';


dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const container = await initializeAdminContainer();
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),

      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                const mongodb = container.resolve('mongodb');
                if (mongodb && mongodb.close) {
                  await mongodb.close(); // close the DB connection properly
                };
              }
            };
          }
        }
      ],

      formatError: (error) => {
        console.error('GraphQL error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          locations: error.locations,
          path: error.path,
        };
      },

    });

    await server.start();

    app.use(
      '/graphql',
      cors({
        origin: '*',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
      }),
      express.json(),
      expressMiddleware(server, {
        isListingCreation: true, // mock flag for testing
        context: async ({ req }) => {
          const token = req.headers.authorization || "";
          let userId = null;
console.log("AUTH HEADER:", req.headers.authorization);

          if (token.startsWith('Bearer ')) { //  'ReferenceError: auth is not defined',
            try {
              const authToken = token.replace('Bearer ', '');
              const decoded = await container.resolve('tokenService').verifyToken(authToken); // implement verify to return { userId }
              userId = decoded?.userId;
            } catch (e) {
              // ignore, unauthenticated
              console.error('Token verification failed:', e);
            }
          }
          return {
            userId,
            token,
            container,
            dataSources: {
              userService: container.resolve('userService'),
              adminService: container.resolve('adminService'),
            }
          };
        }

      })
    );

    httpServer.listen({ port: 4150 }, () =>
      console.log('🚀 Admin Subgraph running at http://localhost:4150/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
};

startApolloServer();