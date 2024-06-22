import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import path from 'path';
import AccountService from '../../infrastructure/services/accountService.js';
import resolvers from './resolvers.js';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import AccountRepository from '../../infrastructure/repositories/accountRepository.js';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';

async function initializeServices() {
  const db = await connectToDatabase();
  const accountRepository = new AccountRepository(db);
  const accountService = new AccountService(accountRepository);
  return { accountService };
}

const app = express();
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
const httpServer=http.createServer(app);
const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  dataSources: () => {({initializeServices: initializeServices }, {accountService: new AccountService()  })},
  context:   ({ req }) => ({
    token: req.headers.authorization || '',
    user: req.headers.user || null,
  }),
})
await server.start();
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
 
  
  }),
);

await new Promise((resolve) => httpServer.listen({ port: 4002 }, resolve));
console.log(`🚀 Server ready at http://localhost:4002/graphql`);