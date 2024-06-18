import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { readFileSync } from 'fs';
import { createContext } from '../../infrastructure/helpers/createContext.js';
import resolvers from './resolvers.js';
import BookingsAPI from './datasources/bookingsApi.js';
import PaymentsAPI from './datasources/paymentsApi.js';
import ListingsAPI from './datasources/listingsApi.js';
import AccountsAPI from './datasources/accountsApi.js';
import { AuthenticationError, ForbiddenError } from '../../infrastructure/utils/errors.js';
import http from 'http';
import cors from 'cors';
import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config();

// const app = express();
// const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
// const httpServer = http.createServer(app);

// const MONGODB_URL = process.env.MONGODB_URL;
// const client = new MongoClient(MONGODB_URL);

// async function startServer() {
//   await client.connect();
//   const db = client.db('air'); // Replace with your database name

//   const server = new ApolloServer({
//     schema: buildSubgraphSchema({ typeDefs, resolvers }),
//     context: ({ req }) => createContext({ req, db }),
//     dataSources: () => ({
//       // bookingsAPI: new BookingsAPI(),
//       // paymentsAPI: new PaymentsAPI(),
//       // listingsAPI: new ListingsAPI(),
//       accountsAPI: new AccountsAPI(),
//     }),
//     plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
//   });

//   await server.start();

//   app.use(
//     '/graphql',
//     cors(),
//     express.json(),
//     expressMiddleware(server, {
//       context: async ({ req }) => ({ token: req.headers.token, db }),
//     }),
//   );

//   await new Promise((resolve) => httpServer.listen({ port: 4011 }, resolve));
//   console.log(`🚀 Server ready at http://localhost:4011/graphql`);
// }

// startServer().catch((err) => console.error(err));

dotenv.config(); // Load .env file
const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer = http.createServer(app);

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  throw new Error("MONGODB_URL environment variable is not defined");
}

const client = new MongoClient(MONGODB_URL);

async function startServer() {
  try {
    await client.connect();
    const db = client.db('air'); // Replace with your database name

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      context: ({ req }) => ({
        token: req.headers.token,
        db,
        dataSources: {
          accountsAPI: new AccountsAPI({ db }), // Initialize AccountsAPI with the db
        },
      }),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({
          token: req.headers.token,
          db,
          dataSources: {
            accountsAPI: new AccountsAPI({ db }), // Initialize AccountsAPI with the db
          },
        }),
      }),
    );

    await new Promise((resolve) => httpServer.listen({ port: 4011 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4011/graphql`);
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer().catch((err) => console.error(err));