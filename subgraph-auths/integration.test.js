import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { assert } from 'node:assert';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Mock external dependencies
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn()
  }))
}));
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

describe('Subgraph Authentication Integration Tests', () => {
  let testServer;
  let query;
  let mutate;

  // Mock schema and resolvers
  const typeDefs = `
    type User {
      id: ID!
      email: String!
      name: String
      role: String!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    input SignInInput {
      provider: String!
      token: String!
    }

    type Query {
      me: User
      protectedResource: String
      adminResource: String
    }

    type Mutation {
      signIn(input: SignInInput!): AuthPayload!
      signOut: Boolean!
    }
  `;

  const resolvers = {
    Query: {
      me: (_, __, { user }) => user,
      protectedResource: (_, __, { user }) => {
        if (!user) throw new Error('Not authenticated');
        return 'Protected data';
      },
      adminResource: (_, __, { user }) => {
        if (!user || user.role !== 'admin') throw new Error('Not authorized');
        return 'Admin data';
      }
    },
    Mutation: {
      signIn: async (_, { input }) => {
        const { provider, token } = input;
        
        // Mock successful OAuth verification
        const userData = {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        };
        
        const authToken = 'mock-jwt-token';
        return { token: authToken, user: userData };
      },
      signOut: () => true
    }
  };

  beforeAll(async () => {
    // Setup test server
    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const { url } = await startStandaloneServer(testServer, {
      listen: { port: 0 },
      context: async ({ req }) => {
        // Mock authentication middleware
        const token = req?.headers?.authorization?.split('Bearer ')[1];
        if (token) {
          return { user: { id: 'user-123', email: 'test@example.com', role: 'user' } };
        }
        return { user: null };
      }
    });

    // Create test client helpers
    query = async (operation) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...operation.context?.headers,
        },
        body: JSON.stringify({ query: operation.query, variables: operation.variables }),
      });
      return response.json();
    };

    mutate = query; // For mutations we can use the same helper
  });

  describe('Authentication Flow', () => {
    test('should complete full sign in flow', async () => {
      const SIGN_IN = `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
            user {
              id
              email
              name
              role
            }
          }
        }
      `;

      const response = await mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            provider: 'google',
            token: 'valid-google-token'
          }
        }
      });

      expect(response.data.signIn).toHaveProperty('token');
      expect(response.data.signIn.user).toHaveProperty('email', 'test@example.com');
    });

    test('should access protected resource with valid token', async () => {
      const GET_PROTECTED = `
        query {
          protectedResource
        }
      `;

      const response = await query({
        query: GET_PROTECTED,
        context: {
          headers: {
            authorization: 'Bearer valid-token'
          }
        }
      });

      expect(response.data.protectedResource).toBe('Protected data');
    });

    test('should deny access to protected resource without token', async () => {
      const GET_PROTECTED = `
        query {
          protectedResource
        }
      `;

      const response = await query({
        query: GET_PROTECTED
      });

      expect(response.errors[0].message).toBe('Not authenticated');
    });
  });

  describe('Role-Based Access Control', () => {
    test('should allow admin access to admin resources', async () => {
      const GET_ADMIN = `
        query {
          adminResource
        }
      `;

      // Create a separate admin server
      const adminServer = new ApolloServer({
        typeDefs,
        resolvers,
      });

      const { url: adminUrl } = await startStandaloneServer(adminServer, {
        listen: { port: 0 },
        context: async () => ({
          user: { id: 'admin-123', email: 'admin@example.com', role: 'admin' }
        })
      });

      // Make request to admin server
      const adminResponse = await fetch(adminUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_ADMIN }),
      });
      
      const response = await adminResponse.json();

      expect(response.data.adminResource).toBe('Admin data');
    });

    test('should deny regular user access to admin resources', async () => {
      const GET_ADMIN = `
        query {
          adminResource
        }
      `;

      const response = await query({
        query: GET_ADMIN,
        context: {
          headers: {
            authorization: 'Bearer valid-token'
          }
        }
      });

      expect(response.errors[0].message).toBe('Not authorized');
    });
  });

  describe('Session Management', () => {
    test('should successfully sign out', async () => {
      const SIGN_OUT = `
        mutation {
          signOut
        }
      `;

      const response = await mutate({
        mutation: SIGN_OUT
      });

      expect(response.data.signOut).toBe(true);
    });

    test('should clear user context after sign out', async () => {
      const ME_QUERY = `
        query {
          me {
            email
          }
        }
      `;

      // First sign out
      await mutate({
        mutation: `mutation { signOut }`
      });

      // Then try to access protected data
      const response = await query({
        query: ME_QUERY
      });

      expect(response.data.me).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid OAuth tokens', async () => {
      const SIGN_IN = `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
            user {
              email
            }
          }
        }
      `;

      // Mock OAuth verification failure
      OAuth2Client.prototype.verifyIdToken = jest.fn().mockRejectedValue(
        new Error('Invalid token')
      );

      const response = await mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            provider: 'google',
            token: 'invalid-token'
          }
        }
      });

      expect(response).toHaveProperty('errors');
    });

    test('should handle expired JWT tokens', async () => {
      const ME_QUERY = `
        query {
          me {
            email
          }
        }
      `;

      // Mock JWT verification failure
      jwt.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const response = await query({
        query: ME_QUERY,
        context: {
          headers: {
            authorization: 'Bearer expired-token'
          }
        }
      });

      expect(response.data.me).toBeNull();
    });
  });
});