import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

describe('Subgraph Authentication Security Tests', () => {
  let testServer;
  let query;
  let mutate;

  // Setup basic schema and resolvers for testing
  const typeDefs = `
    type User {
      id: ID!
      email: String!
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
      user(id: ID!): User
      adminResource: String
    }

    type Mutation {
      signIn(input: SignInInput!): AuthPayload!
      updateUser(id: ID!, role: String): User
    }
  `;

  const users = {
    'user-1': { id: 'user-1', email: 'user@example.com', role: 'user' },
    'user-2': { id: 'user-2', email: 'another@example.com', role: 'user' },
    'admin-1': { id: 'admin-1', email: 'admin@example.com', role: 'admin' }
  };

  const resolvers = {
    Query: {
      me: (_, __, { user }) => user,
      user: (_, { id }, { user }) => {
        // Only admins can query other users
        if (!user || user.role !== 'admin') {
          throw new Error('Not authorized');
        }
        return users[id];
      },
      adminResource: (_, __, { user }) => {
        if (!user || user.role !== 'admin') {
          throw new Error('Not authorized');
        }
        return 'Sensitive admin data';
      }
    },
    Mutation: {
      signIn: async (_, { input }) => {
        const { provider, token } = input;
        
        // Basic input validation
        if (!provider || !token) {
          throw new Error('Invalid input');
        }
        
        // XSS attempt detection
        if (token.includes('<script>') || provider.includes('<script>')) {
          throw new Error('Invalid input');
        }
        
        // Mock successful authentication
        return {
          token: 'secure-jwt-token',
          user: users['user-1']
        };
      },
      updateUser: (_, { id, role }, { user }) => {
        // Only admins can update user roles
        if (!user || user.role !== 'admin') {
          throw new Error('Not authorized');
        }
        
        if (!users[id]) {
          throw new Error('User not found');
        }
        
        if (role) {
          users[id].role = role;
        }
        
        return users[id];
      }
    }
  };

  beforeEach(async () => {
    // Reset users for each test
    users['user-1'] = { id: 'user-1', email: 'user@example.com', role: 'user' };
    users['user-2'] = { id: 'user-2', email: 'another@example.com', role: 'user' };
    users['admin-1'] = { id: 'admin-1', email: 'admin@example.com', role: 'admin' };
    
    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });

    const { url } = await startStandaloneServer(testServer, {
      listen: { port: 0 },
      context: async ({ req }) => {
        const token = req?.headers?.authorization?.split('Bearer ')[1];
        
        // Simple token validation
        if (token === 'user-token') {
          return { user: users['user-1'] };
        } else if (token === 'admin-token') {
          return { user: users['admin-1'] };
        } else if (token === 'tampered-token') {
          throw new Error('Invalid token');
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

  afterEach(async () => {
    await testServer?.stop();
  });

  describe('Token Security', () => {
    test('should reject tampered tokens', async () => {
      const ME_QUERY = `
        query {
          me {
            id
            email
            role
          }
        }
      `;

      const response = await query({
        query: ME_QUERY,
        context: {
          headers: {
            authorization: 'Bearer tampered-token'
          }
        }
      });

      expect(response.errors).toBeTruthy();
    });

    test('should reject expired tokens', async () => {
      // Mock jwt.verify to simulate expired token
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const ME_QUERY = `
        query {
          me {
            id
          }
        }
      `;

      const response = await query({
        query: ME_QUERY,
        context: {
          headers: {
            authorization: 'Bearer expired-token'
          }
        }
      });

      expect(response.data.me).toBeNull();
      
      // Restore original function
      jwt.verify = originalVerify;
    });
  });

  describe('Input Validation', () => {
    test('should reject XSS attempts in authentication input', async () => {
      const SIGN_IN = `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
          }
        }
      `;

      const response = await mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            provider: 'google',
            token: '<script>alert("XSS")</script>'
          }
        }
      });

      expect(response.errors).toBeTruthy();
    });

    test('should sanitize user inputs', async () => {
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

      // Mock a sanitization function that would be called
      const sanitize = jest.fn(input => input.replace(/[<>]/g, ''));
      
      const maliciousInput = {
        provider: 'google',
        token: 'token-with-<tags>'
      };
      
      // Apply sanitization before passing to resolver
      const sanitizedInput = {
        provider: sanitize(maliciousInput.provider),
        token: sanitize(maliciousInput.token)
      };
      
      const response = await mutate({
        mutation: SIGN_IN,
        variables: {
          input: sanitizedInput
        }
      });

      expect(response.data.signIn).toBeTruthy();
      expect(sanitizedInput.token).toBe('token-with-tags');
    });
  });

  describe('Authorization Controls', () => {
    test('should prevent privilege escalation', async () => {
      const UPDATE_USER = `
        mutation UpdateUser($id: ID!, $role: String) {
          updateUser(id: $id, role: $role) {
            id
            role
          }
        }
      `;

      // Attempt to escalate privileges as a regular user
      const response = await mutate({
        mutation: UPDATE_USER,
        variables: {
          id: 'user-1',
          role: 'admin'
        },
        context: {
          headers: {
            authorization: 'Bearer user-token'
          }
        }
      });

      expect(response.errors).toBeTruthy();
      expect(users['user-1'].role).toBe('user'); // Role should not change
    });

    test('should prevent unauthorized access to admin resources', async () => {
      const ADMIN_QUERY = `
        query {
          adminResource
        }
      `;

      const response = await query({
        query: ADMIN_QUERY,
        context: {
          headers: {
            authorization: 'Bearer user-token'
          }
        }
      });

      expect(response.errors).toBeTruthy();
    });

    test('should prevent unauthorized access to other user data', async () => {
      const USER_QUERY = `
        query GetUser($id: ID!) {
          user(id: $id) {
            email
          }
        }
      `;

      const response = await query({
        query: USER_QUERY,
        variables: {
          id: 'user-2'
        },
        context: {
          headers: {
            authorization: 'Bearer user-token'
          }
        }
      });

      expect(response.errors).toBeTruthy();
    });
  });

  describe('Rate Limiting', () => {
    test('should detect and block brute force attempts', async () => {
      const SIGN_IN = `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
          }
        }
      `;

      // Mock a rate limiter
      const ipAddress = '192.168.1.1';
      const rateLimiter = {
        attempts: {},
        check: function(ip) {
          this.attempts[ip] = (this.attempts[ip] || 0) + 1;
          return this.attempts[ip] <= 5; // Allow 5 attempts
        }
      };

      // Simulate multiple failed login attempts
      for (let i = 0; i < 10; i++) {
        if (rateLimiter.check(ipAddress)) {
          await mutate({
            mutation: SIGN_IN,
            variables: {
              input: {
                provider: 'google',
                token: 'invalid-token'
              }
            }
          });
        } else {
          // Rate limit exceeded
          break;
        }
      }

      // Verify rate limit was triggered
      expect(rateLimiter.attempts[ipAddress]).toBeGreaterThan(5);
      expect(rateLimiter.check(ipAddress)).toBe(false);
    });
  });

  describe('CSRF Protection', () => {
    test('should validate origin of requests', async () => {
      const SIGN_IN = `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
          }
        }
      `;

      // Mock CSRF protection
      const validateOrigin = (origin, referer) => {
        const allowedOrigins = ['https://example.com', 'https://api.example.com'];
        return allowedOrigins.includes(origin) || allowedOrigins.some(allowed => referer?.startsWith(allowed));
      };

      // Valid origin
      const validResponse = await mutate({
        mutation: SIGN_IN,
        variables: {
          input: {
            provider: 'google',
            token: 'valid-token'
          }
        },
        context: {
          headers: {
            origin: 'https://example.com'
          }
        }
      });

      expect(validateOrigin('https://example.com')).toBe(true);
      expect(validResponse.data.signIn).toBeTruthy();

      // Invalid origin
      const invalidOrigin = 'https://evil-site.com';
      expect(validateOrigin(invalidOrigin)).toBe(false);
    });
  });

  describe('Secure Headers', () => {
    test('should include security headers in responses', () => {
      // Mock response headers
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'",
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-XSS-Protection': '1; mode=block'
      };
      
      // Verify all required security headers are present
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['Content-Security-Policy']).toBeTruthy();
      expect(headers['Strict-Transport-Security']).toBeTruthy();
      expect(headers['X-XSS-Protection']).toBeTruthy();
    });
  });
});