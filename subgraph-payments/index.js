import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import initializePaymentContainer from '../services/DB/initPaymentContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';
import PaymentService from '../services/paymentService.js';

dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // Initialize payment container
    const paymentContainer = await initializePaymentContainer();

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
                // Cleanup if needed
              }
            };
          }
        }
      ],
      introspection: true,
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          paymentService: paymentContainer.resolve('paymentService')
        }
      })
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server)
    );

    httpServer.listen({ port: 4070 }, () => {
      console.log(`🚀 Payments subgraph ready at http://localhost:4070/graphql`);
    });
  } catch (error) {
    console.error('Error starting payments server:', error);
  }
};

startApolloServer();