import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initializeLocationContainer from '../services/DB/initLocationContainer.js';
import { GraphQLError } from 'graphql';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';


dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const mysqlContainer = await initializeLocationContainer({ services: [] });


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
                await mysqlContainer.resolve('mysqldb').end();
                await mysqlContainer.resolve('locationService').end();

              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          
          locationService: mysqlContainer.resolve('locationService'),
        },
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
            
            locationService: mysqlContainer.resolve('locationService')
          },
        })
      })
    );

    httpServer.listen({ port: 4140 }, () =>
      console.log('Server is running on http://localhost:4140/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
};

startApolloServer();