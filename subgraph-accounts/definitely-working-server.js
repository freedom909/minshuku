import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Ultra simple schema that will definitely work
const typeDefs = `
  type Account {
    id: ID!
    email: String!
    createdAt: String!
  }

  type Query {
    account(id: ID!): Account
    accounts: [Account]
    hello: String!
  }
`;

// Simple resolvers that return actual data
const resolvers = {
  Query: {
    account: (_, { id }) => ({
      id: id,
      email: 'test@example.com',
      createdAt: new Date().toISOString()
    }),
    accounts: () => [{
      id: '1',
      email: 'test@example.com',
      createdAt: new Date().toISOString()
    }],
    hello: () => 'Hello from Accounts Server!'
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
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