import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeAdminContainer from '../services/DB/initAdminContainer.js';
import { GraphQLError } from 'graphql';
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
               const mysql = container.resolve('mysql');
          if (mysql && mysql.end) {
            await mysql.end(); // close the DB connection properly
          };
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          userService: container.resolve('userService'),
        }
      }),
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
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: {
            userService: container.resolve('userService')
          },
        })
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