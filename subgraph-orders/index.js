import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';

import resolvers from './resolvers.js';
import initializeOrderContainer from '../services/DB/initOrderContainer.js';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // Initialize MySQL container
    const orderContainer = await initializeOrderContainer();

    const app = express();
    const httpServer = http.createServer(app);

    // Initialize Apollo Server
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                // Close the database connections
                if (orderContainer.resolve('mysqldb')) {
                  await orderContainer.resolve('mysqldb').close();
                }
              }
            };
          }
        }
      ],

      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        
        return {
          user: { token },
          dataSources: {
            orderService: mysqlContainer.resolve('orderService'),
          }
        };
      }
    });

    // Start Apollo Server
    await server.start();

    // Apply Express middleware for handling requests
    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server)
    );

    // Start the HTTP server
    httpServer.listen({ port: 4110 }, () => {
      console.log(`🚀 Server ready at http://localhost:4110/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

// Start the server
startApolloServer();