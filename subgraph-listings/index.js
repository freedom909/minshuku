import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initMysqlContainer from '../infrastructure/DB/initMysqlContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import ListingService from '../infrastructure/services/listingService.js'; // Import necessary services

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // Pass the required services
    const container = await initMysqlContainer({ services: [ListingService] });

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
                await container.resolve('mysqlDB').close();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          listingService: container.resolve('ListingService'),
        }
      })
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: {
            listingService: container.resolve('ListingService'),
          }
        })
      })
    );

    httpServer.listen({ port: 4003 }, () => {
      console.log(`🚀 Server ready at http://localhost:4003/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startApolloServer();
