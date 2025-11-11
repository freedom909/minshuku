// subgraph-accounts/index.js
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';

// ✅ Load schema
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

// ✅ Simple in-memory data
let accounts = [
  { id: '1', email: 'john@example.com', createdAt: new Date().toISOString() }
];
let users = [
  { id: '1', name: 'John Doe', role: 'HOST', email: 'john@example.com' }
];

// ✅ Federation resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello from Accounts subgraph!',
    account: (_, { id }) => accounts.find(a => a.id === id),
    accounts: () => accounts,
    user: (_, { id }) => users.find(u => u.id === id),
    me: () => users[0],
  },
  Mutation: {
    createAccount: (_, { email }) => {
      const newAcc = { id: String(accounts.length + 1), email, createdAt: new Date().toISOString() };
      accounts.push(newAcc);
      return newAcc;
    }
  },
  // Federation entity resolver
  Account: {
    __resolveReference(ref) {
      return accounts.find(a => a.id === ref.id);
    }
  }
};

// ✅ Build Apollo subgraph schema
const schema = buildSubgraphSchema({ typeDefs, resolvers });

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    schema,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  // ✅ CORS
  app.use(cors({
    origin: ['https://studio.apollographql.com', 'http://localhost:4030'],
    credentials: true,
  }));

  // ✅ GraphQL endpoint (browser + gateway compatible)
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server)
  );

  // ✅ Add a friendly homepage (for Sandbox)
  app.get('/', (req, res) => {
    res.send(`
      <html>
        <head><title>Accounts Subgraph</title></head>
        <body style="font-family:sans-serif;">
          <h1>🚀 Accounts Subgraph Running</h1>
          <p>GraphQL endpoint: <a href="http://localhost:4030/graphql">/graphql</a></p>
          <p><a href="https://studio.apollographql.com/sandbox?endpoint=http://localhost:4030/graphql" target="_blank">Open Apollo Sandbox</a></p>
        </body>
      </html>
    `);
  });

  httpServer.listen(4030, () => {
    console.log('✅ Accounts Subgraph running at http://localhost:4030/graphql');
  });
}

startServer().catch(console.error);
