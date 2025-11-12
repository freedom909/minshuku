import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';

// Simple, clean schema that will definitely work
const typeDefs = gql`
  extend schema
    @link(url: "https://specs.apollo.dev/federation/v2.8", import: ["@key"])

  type Account @key(fields: "id") {
    id: ID!
    email: String!
    createdAt: String!
  }

  interface User @key(fields: "id") {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Query {
    account(id: ID!): Account
    accounts: [Account]
    user(id: ID!): User
    me: User
    viewer: Account
  }

  type Mutation {
    createAccount(email: String!, password: String!): Account
  }
`;

// Simple resolvers
const resolvers = {
  Query: {
    account: (_, { id }) => ({ id, email: 'test@example.com', createdAt: new Date().toISOString() }),
    accounts: () => [{ id: '1', email: 'test@example.com', createdAt: new Date().toISOString() }],
    user: (_, { id }) => ({ id, name: 'Test User', email: 'test@example.com', role: 'HOST' }),
    me: () => ({ id: '1', name: 'Test User', email: 'test@example.com', role: 'HOST' }),
    viewer: () => ({ id: '1', email: 'test@example.com', createdAt: new Date().toISOString() })
  },
  Mutation: {
    createAccount: (_, { email, password }) => ({
      id: '2', 
      email, 
      createdAt: new Date().toISOString()
    })
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
  console.log(`✅ Accounts server ready at ${url}`);
  console.log('📊 GraphQL endpoint: http://localhost:4030/graphql');
}).catch(error => {
  console.error('❌ Error starting server:', error);
});