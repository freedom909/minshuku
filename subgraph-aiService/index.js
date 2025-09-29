import dotenv from 'dotenv';
dotenv.config();
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
import initializeAiContainer from '../services/DB/initAiContainer.js';
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const container = await initializeAiContainer();
    console.log('Registered services:', Object.keys(container.registrations));

    // 验证 aiService 是否能解析
    try {
      const aiService = container.resolve('aiService');
      console.log('✅ aiService resolved:', typeof aiService);
    } catch (error) {
      console.error('❌ Failed to resolve aiService:', error);
    }

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
                await container.dispose(); // ✅ Correct
              },
            };
          },
        },
      ],

      context: async ({ req }) => {
        const resolvedServices = {
          aiService: container.resolve('aiService'),
          userService: container.resolve('userService'),
          listingService: container.resolve('listingService'),
          bookingService: container.resolve('bookingService'),
          paymentService: container.resolve('paymentService')
        };

        return {
          ...resolvedServices, // inject directly
          userId: req?.user?.id || null,
        };
      }

    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => {
          const MACHINE_URL = process.env.MACHINE_URL || "http://machine:8000/graphql";

          try {
            const aiService = container.resolve('aiService');
            const userService = container.resolve('userService');
            const listingService = container.resolve('listingService');
            const bookingService = container.resolve('bookingService');
            const paymentService = container.resolve('paymentService');

            const dataSources = {
              aiService,
              userService,
              listingService,
              bookingService,
              paymentService,
              machineUrl: MACHINE_URL   // 👈 add here
            };

            console.log('✅ Built context with dataSources:', Object.keys(dataSources));

            return {
              userId: req?.user?.id || null,
              dataSources
            };
          } catch (err) {
            console.error('❌ Error resolving services in context:', err);
            throw err;
          }
        }
      })
    );


    httpServer.listen({ port: 4100 }, () =>
      console.log('Server is running on http://localhost:4100/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
};

startApolloServer();
