const { asClass, asValue, asFunction } = require('awilix');
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initMysqlContainer from '../infrastructure/DB/initMysqlContainer.js';
import initMongoContainer from '../infrastructure/DB/initMongoContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';


dotenv.config();

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const startApolloServer = async () => {
  try {
    // Initialize MySQL and MongoDB containers
    const mysqlContainer = await initMysqlContainer({ services: [
      ListingService,
      BookingService,
      PaymentService,  // Add payment service here if needed
    ] });

    const mongoContainer = await initMongoContainer({ services: [
      UserService,
    ]});

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
                await mysqlContainer.resolve('mysqldb').close();
                await mongoContainer.resolve('mongodb').close();  // Ensure MongoDB client is closed properly
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        Introspection:true,  // Enable introspection for GraphQL Playground
        dataSources: {
          listingService: mysqlContainer.resolve('ListingService'),
          bookingService: mysqlContainer.resolve('BookingService'),
          paymentService: mysqlContainer.resolve('PaymentService'),
          userService: mongoContainer.resolve('UserService'),  // Ensure correct resolution of services
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
          Introspection:true, 
          dataSources: {
            listingService: mysqlContainer.resolve('ListingService'),
            bookingService: mysqlContainer.resolve('BookingService'),
            userService: mongoContainer.resolve('UserService'),  // Ensure correct resolution of services
          }
        })
      })
    );

    httpServer.listen({ port: 4012 }, () => {
      console.log(`🚀 Server ready at http://localhost:4012/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startApolloServer();