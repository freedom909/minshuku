import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { initializeContainer, container } from '../infrastructure/DB/container.js';
import resolvers from './resolvers.js';

async function startApolloServer() {
  try {
    await initializeContainer();

    const app = express();
    const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await container.resolve('db').client.close();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        user: req.headers.user || null,
        dataSources: {
          accountService: container.resolve('accountService'),
          listingService: container.resolve('listingService'),
          bookingService: container.resolve('bookingService')
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
            accountService: container.resolve('accountService'),
            listingService: container.resolve('listingService'),
            bookingService: container.resolve('bookingService')
          }
        })
      })
    );

    await new Promise((resolve) => httpServer.listen({ port: 4001 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4001/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startApolloServer();
