// gateway/index.js
import { ApolloServer } from '@apollo/server';
import { ApolloGateway } from '@apollo/gateway';
import { startStandaloneServer } from '@apollo/server/standalone';

const gateway = new ApolloGateway({
  serviceList: [
    { name: 'users', url: 'http://localhost:4010/graphql' },
    // { name: 'listings', url: 'http://localhost:4040/graphql' },
    // { name: 'reviews', url: 'http://localhost:4080/graphql' },
    // Add other subgraphs here
  ],
});

async function startGateway() {
  const server = new ApolloServer({ gateway, subscriptions: false, context: ({ req }) => ({ req })});

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Gateway running at ${url}`);
}

startGateway();
