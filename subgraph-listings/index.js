import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import gql from 'graphql-tag';
import express from 'express';
import { initializeContainer, container } from '../infrastructure/DB/container.js';
import resolvers from './resolvers.js';
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import router from './router.js'; // Ensure this is correctly imported

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
                await container.resolve('db').close();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          listingService: container.resolve('listingService'),
        }
      })
    });

    app.use(router); // Use router here
    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.authorization || '',
          dataSources: {
            listingService: container.resolve('listingService'),
          }
        })
      })
    );

    await new Promise((resolve) => httpServer.listen({ port: 4013 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4013/graphql`);
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startApolloServer();
