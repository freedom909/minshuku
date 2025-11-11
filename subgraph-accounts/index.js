import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';

console.log('🚀 Starting Accounts GraphQL server with Apollo Federation...');

// Load GraphQL schema from file
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

// Simple in-memory storage for demo
let accounts = [
  { id: '1', email: 'john@example.com', createdAt: new Date().toISOString() }
];

let users = [
  { 
    id: '1', 
    name: 'John Doe', 
    role: 'HOST', 
    picture: 'https://example.com/avatar.jpg', 
    email: 'john@example.com', 
    nickname: 'john',
    listings: [],
    bookings: [],
    carts: []
  }
];

let listings = [
  { 
    id: '1', 
    title: 'Cozy Apartment', 
    description: 'A beautiful apartment in the city center', 
    price: 100.0, 
    hostId: '1', 
    latitude: 40.7128, 
    longitude: -74.0060 
  }
];

// Federation entities resolver
const _entities = (representations) => {
  return representations.map(rep => {
    if (rep.__typename === 'Account') {
      return accounts.find(account => account.id === rep.id);
    }
    if (rep.__typename === 'User' || rep.__typename === 'Host' || rep.__typename === 'Guest') {
      return users.find(user => user.id === rep.id);
    }
    if (rep.__typename === 'Listing') {
      return listings.find(listing => listing.id === rep.id);
    }
    return null;
  });
};

// Complete resolver for Apollo Federation
const resolvers = {
  Query: {
    hello: () => 'Hello World from GraphQL Federation!',
    
    // Account queries
    account: (_, { id }) => accounts.find(account => account.id === id),
    accounts: () => accounts,
    viewer: () => accounts[0],
    
    // User queries
    user: (_, { id }) => users.find(user => user.id === id),
    getUser: (_, { id }) => users.find(user => user.id === id),
    me: () => users[0],
    
    // Listing queries
    listings: () => listings,
    
    // Cart queries (simplified)
    cart: () => ({ id: '1', items: [], createdAt: new Date().toISOString() }),
    carts: () => [{ id: '1', items: [], createdAt: new Date().toISOString() }],
    
    // Booking queries (simplified)
    bookings: () => [],
    
    // Federation required queries
    _service: () => ({}),
    _entities
  },
  
  Mutation: {
    // Account mutations
    createAccount: (_, { input }) => {
      const newAccount = {
        id: String(accounts.length + 1),
        email: input.email,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      
      return {
        code: 200,
        success: true,
        message: 'Account created successfully',
        account: newAccount
      };
    },
    
    updateAccountEmail: (_, { input }) => {
      const account = accounts.find(acc => acc.id === input.id);
      if (account) {
        account.email = input.email;
        return {
          code: 200,
          success: true,
          message: 'Email updated successfully',
          account: account
        };
      }
      return {
        code: 404,
        success: false,
        message: 'Account not found'
      };
    },
    
    updateAccountPassword: (_, { input }) => {
      const account = accounts.find(acc => acc.id === input.id);
      if (account) {
        return {
          code: 200,
          success: true,
          message: 'Password updated successfully',
          account: account
        };
      }
      return {
        code: 404,
        success: false,
        message: 'Account not found'
      };
    },
    
    // Listing mutations
    createListing: (_, { input }) => {
      const newListing = {
        id: String(listings.length + 1),
        title: input.title,
        description: input.description,
        price: input.price,
        hostId: input.hostId,
        latitude: 40.7128, // Default coordinates
        longitude: -74.0060
      };
      listings.push(newListing);
      
      return {
        code: 200,
        success: true,
        message: 'Listing created successfully',
        listing: newListing
      };
    }
  },
  
  // Type resolvers
  User: {
    __resolveType: (user) => {
      if (user.role === 'HOST') return 'Host';
      if (user.role === 'GUEST') return 'Guest';
      return 'User';
    }
  },
  
  Host: {
    listings: (host) => listings.filter(listing => listing.hostId === host.id)
  },
  
  Guest: {
    bookings: () => [],
    carts: () => [{ id: '1', items: [], createdAt: new Date().toISOString() }],
    listings: () => []
  },
  
  Listing: {
    location: () => ({
      id: '1',
      name: 'New York',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    })
  }
};

const startApolloServer = async () => {
  try {
    const app = express();
    const httpServer = http.createServer(app);

    // Apollo Federation Server configuration
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      introspection: true,
      csrfPrevention: false,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });

    await server.start();

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'hello-world-graphql'
      });
    });

    // Apollo Federation Sandbox
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Accounts GraphQL Federation Server</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              .container { max-width: 800px; margin: 0 auto; }
              .endpoint { background: #f5f5f5; padding: 10px; border-radius: 5px; }
              .query { background: #f0f8ff; padding: 10px; border-radius: 5px; margin: 10px 0; }
              .federation { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 Accounts GraphQL Federation Server</h1>
              <div class="federation">
                <strong>🔗 Apollo Federation Enabled</strong>
                <p>This server is part of a federated GraphQL architecture</p>
              </div>
              
              <p>GraphQL endpoint: <code class="endpoint">http://localhost:4030/graphql</code></p>
              <p><a href="https://studio.apollographql.com/sandbox?endpoint=http://localhost:4030/graphql" target="_blank">Open Apollo Sandbox</a></p>
              
              <h3>🔍 Available Queries:</h3>
              
              <div class="query">
                <strong>Hello World:</strong>
                <pre>{
  hello
}</pre>
              </div>
              
              <div class="query">
                <strong>Get current user:</strong>
                <pre>{
  me {
    id
    name
    email
    role
    picture
    nickname
  }
}</pre>
              </div>
              
              <div class="query">
                <strong>Get account by ID:</strong>
                <pre>{
  account(id: "1") {
    id
    email
    createdAt
  }
}</pre>
              </div>
              
              <div class="query">
                <strong>Get all listings:</strong>
                <pre>{
  listings {
    id
    title
    description
    price
    hostId
  }
}</pre>
              </div>
              
              <h3>✏️ Available Mutations:</h3>
              
              <div class="query">
                <strong>Create new account:</strong>
                <pre>mutation {
  createAccount(input: {email: "new@example.com", password: "password123"}) {
    success
    message
    account {
      id
      email
      createdAt
    }
  }
}</pre>
              </div>
              
              <div class="query">
                <strong>Create new listing:</strong>
                <pre>mutation {
  createListing(input: {
    title: "Beautiful Apartment",
    description: "A cozy place in the city",
    price: 150.0,
    hostId: "1",
    pictures: ["img1.jpg"],
    numOfBeds: 2,
    locationType: APARTMENT,
    amenityIds: ["1"],
    checkInDate: "2024-01-01",
    checkOutDate: "2024-01-05"
  }) {
    success
    message
    listing {
      id
      title
      price
    }
  }
}</pre>
              </div>
            </div>
          </body>
        </html>
      `);
    });

    // Simple CORS configuration
    app.use(cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4030'],
      credentials: true
    }));

    // GraphQL endpoint
    app.use('/graphql', express.json(), expressMiddleware(server));

    httpServer.listen({ port: 4030 }, () => {
      console.log('🚀 Server started successfully');
      console.log('📊 GraphQL endpoint: http://localhost:4030/graphql');
      console.log('📊 Health check: http://localhost:4030/health');
      console.log('📊 Home page: http://localhost:4030/');
    });

  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startApolloServer();


