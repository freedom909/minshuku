import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import path from 'path';
import UserService from './datasources/userService.js';
import resolvers from './resolvers.js';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import  initializeServices  from './datasources/initializeService.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';


const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer=http.createServer(app);
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  context: async({req}) => {
    const {userService}=await initializeServices();
    return {
      token: req.headers.authorization || '',
      user: req.headers.user || null,
      dataSource:{userService},
    }
  }
});
 

await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
 
  
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4011 }, resolve));
console.log(`🚀 Server ready at http://localhost:4011/graphql`);