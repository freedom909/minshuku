// gateway/index.js
import { ApolloServer } from '@apollo/server';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { startStandaloneServer } from '@apollo/server/standalone';

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'users', url: 'http://localhost:4010/graphql' },
      { name: 'listings', url: 'http://localhost:4040/graphql' },
      { name: 'bookings', url: 'http://localhost:4050/graphql' },
      // // { name: 'reviews', url: 'http://localhost:4080/graphql' },
      { name: 'amenities', url: 'http://localhost:4090/graphql' },
      { name: 'locations', url: 'http://localhost:4140/graphql' },
      { name: 'aiService', url: 'http://localhost:4100/graphql' },
     //{ name: 'machine', url: 'http://127.0.0.1:8000/graphql' },
    ]
  })
});

async function startGateway() {
  const server = new ApolloServer({ gateway, subscriptions: false, context: ({ req }) => ({ req }) });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
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