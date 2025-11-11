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
import initAccountContainer from '../services/DB/initAccountContainer.js';
import resolvers from './resolvers.js';

// ✅ Load schema
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // ✅ Initialize dependency injection container
  let container;
  try {
    container = await initAccountContainer();
    console.log('✅ Account container initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize account container:', error);
    process.exit(1);
  }

  // ✅ Build Apollo subgraph schema
  const schema = buildSubgraphSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    introspection: true,
    includeStacktraceInErrorResponses: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          console.log('✅ Apollo Server starting with introspection enabled');
          return {
            async drainServer() {
              console.log('Server is shutting down');
            }
          };
        }
      }
    ],
  });

  await server.start();

  // ✅ CORS - More permissive for development
  app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight', 'X-Requested-With'],
  }));

  // ✅ GraphQL endpoint with dependency injection
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract user from JWT token
        const authHeader = req.headers.authorization;
        let user = null;
        let userId = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            // In a real implementation, you would verify the JWT token here
            // For now, we'll extract user ID from token if available
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            userId = decoded.sub || decoded.id;
            user = { sub: userId };
          } catch (error) {
            console.warn('Invalid token format:', error.message);
          }
        }

        return {
          dataSources: {
            accountService: container.resolve('accountService'),
            userService: container.resolve('userService'),
          },
          userId,
          user,
        };
      },
    })
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
