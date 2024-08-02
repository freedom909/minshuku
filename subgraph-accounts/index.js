import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
// import initMongoContainer from '../infrastructure/DB/initMongoContainer.js';
// import initListingContainer from '../infrastructure/DB/initListingContainer.js';
// import initCartContainer from '../infrastructure/DB/initCartContainer.js';
// import initReviewContainer from '../infrastructure/DB/initReviewContainer.js';
// import initProfileContainer from '../infrastructure/DB/initProfileContainer.js';
// import initBookingContainer from '../infrastructure/DB/initBookingContainer.js';
import initAccountContainer  from '../infrastructure/DB/initAccountContainer.js';
import resolvers from './resolvers.js';


const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    const container = await initAccountContainer();

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      Introspection:true,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await container.resolve('mongodb').end();
              }
            };
          }
        }
      ],
      context: async ({ req }) => ({
        token: req.headers.authorization || '',
        dataSources: {
          accountService: container.resolve('accountService'),
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
          }
        })
      })
    );

    httpServer.listen({ port: 4001 }, () => {
      console.log(`🚀 Server ready at http://localhost:4001/graphql`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startApolloServer();

// import { ApolloServer } from '@apollo/server';

// import { gql } from 'graphql-tag';
// import { readFileSync } from 'fs';
// import http from 'http';
// import express from 'express';
// import cors from 'cors';
// // import { ApolloServer, gql } from 'apollo-server';
// import { ApolloServer } from '@apollo/server';
// import Account from '../infrastructure/models/account.js'; // Adjust the path as necessary
// import connectToMongoDB from '../infrastructure/seeders/connectMongo.js'; // Adjust path as necessary
// import resolvers from './resolvers.js';
// import { buildSubgraphSchema } from '@apollo/subgraph';
// const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));


// const startApolloServer = async () => {
//   await connectToMongoDB();

//   const server = new ApolloServer({
//     schema:buildSubgraphSchema({ typeDefs, resolvers })
//   });

//   server.listen({ port: 4001 }).then(({ url }) => {
//     console.log(`🚀 Server ready at ${url}`);
//   });
// };

// startApolloServer();

