import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';

// Load minimal schema with proper Federation directives
const typeDefs = gql(readFileSync('./minimal-schema.graphql', 'utf8'));

// Simple resolvers
const resolvers = {
  Query: {
    hello: () => 'Hello from accounts!',
    account: (_, { id }) => ({ id, email: 'test@example.com', createdAt: new Date().toISOString() }),
    accounts: () => [{ id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }],
    viewer: () => ({ id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }),
    user: (_, { id }) => ({ 
      id, 
      name: 'Test User', 
      role: 'HOST', 
      picture: 'test.jpg', 
      email: 'test@example.com', 
      nickname: 'test'
    }),
    me: () => ({ 
      id: '1', 
      name: 'Test User', 
      role: 'HOST', 
      picture: 'test.jpg', 
      email: 'test@example.com', 
      nickname: 'test'
    }),
    _service: () => ({ sdl: typeDefs.loc.source.body })
  }
};

// Build Federation schema
const schema = buildSubgraphSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
  introspection: true,
  csrfPrevention: false
});

startStandaloneServer(server, { 
  listen: { port: 4030 } 
}).then(({ url }) => {
  console.log(`🚀 Accounts server ready at ${url}`);
});