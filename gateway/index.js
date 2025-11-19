// gateway/index.js (nodemon restart trigger)
import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { startStandaloneServer } from '@apollo/server/standalone';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'accounts', url: process.env.ACCOUNTS_SUBGRAPH_URL || 'http://localhost:4020/graphql' },
      { name: 'admin', url: process.env.ADMIN_SUBGRAPH_URL || 'http://localhost:4150/graphql' },
      { name: 'profiles', url: process.env.PROFILES_SUBGRAPH_URL || 'http://localhost:4030/graphql' },
      { name: 'users', url: process.env.USERS_SUBGRAPH_URL || 'http://localhost:4010/graphql' },
      { name: 'listings', url: 'http://localhost:4040/graphql' },
      { name: 'carts', url: process.env.CARTS_SUBGRAPH_URL || 'http://localhost:4060/graphql' },
      { name: 'bookings', url: 'http://localhost:4050/graphql' },
      { name: 'reviews', url: 'http://localhost:4080/graphql' },
      { name: 'amenities', url: 'http://localhost:4090/graphql' },
      { name: 'locations', url: process.env.LOCATIONS_SUBGRAPH_URL || 'http://localhost:4140/graphql' },
      { name: 'aiService', url: 'http://localhost:4100/graphql' },
      { name: 'orders', url: process.env.ORDERS_SUBGRAPH_URL || 'http://localhost:4110/graphql' },
      { name: 'payments', url: 'http://localhost:4070/graphql' }
    ],
    // Add configuration to handle introspection better
    introspectionHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    pollIntervalInMs: 10000 // Poll every 10 seconds for schema changes
  })
});

async function startGateway() {
  const server = new ApolloServer({ gateway, subscriptions: false, context: ({ req }) => ({ req }) });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.GATEWAY_PORT) || 4000 },
    context: async ({ req }) => ({ req }),
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  });

  console.log(`🚀 Gateway running at ${url}`);
}

startGateway();