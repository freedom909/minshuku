const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { readFileSync } = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const resolvers = require('./resolvers');
const authMiddleware = require('./middleware/auth');

// Load environment variables
dotenv.config();

// Read schema
const typeDefs = readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

async function startServer() {
  // Create Express app
  const app = express();
  
  // Configure CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
  
  // Apply auth middleware
  app.use(authMiddleware);
  
  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Pass user from auth middleware to resolvers
      return { user: req.user };
    },
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      
      // Don't expose internal server errors to clients
      if (error.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return new Error('Internal server error');
      }
      
      return error;
    }
  });
  
  // Start Apollo Server
  await server.start();
  
  // Apply Apollo middleware to Express
  server.applyMiddleware({ app, path: '/graphql', cors: false });
  
  // Start Express server
  const PORT = process.env.PORT || 4010;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});