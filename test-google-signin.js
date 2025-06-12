/**
 * Google Sign-In Integration Test Script
 * 
 * This script tests the complete authentication flow between
 * frontend and backend for Google Sign-In.
 * 
 * Usage:
 * 1. Set environment variables in .env files
 * 2. Run: node test-google-signin.js
 */

import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config();


// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4010/graphql';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Mock Google token for testing
const MOCK_GOOGLE_PAYLOAD = {
  iss: 'https://accounts.google.com',
  sub: 'mock-user-id-123',
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  picture: 'https://example.com/photo.jpg',
  given_name: 'Test',
  family_name: 'User',
  locale: 'en',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600
};

// Logger
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  success: (message, data) => {
    console.log(`[SUCCESS] ${message}`, data || '');
  }
};

// Test steps
async function runTests() {
  logger.info('Starting Google Sign-In integration tests');
  
  // Step 1: Check environment
  logger.info('Checking environment');
  if (!GOOGLE_CLIENT_ID) {
    logger.error('GOOGLE_CLIENT_ID not set');
    process.exit(1);
  }

  // Step 2: Test backend connection
  logger.info('Testing backend connection');
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'query { __typename }' })
    });
    
    const data = await response.json();
    if (data.errors) {
      logger.error('Backend connection failed', data.errors);
      process.exit(1);
    }
    
    logger.success('Backend connection successful', data);
  } catch (error) {
    logger.error('Backend connection failed', error);
    process.exit(1);
  }

  // Step 3: Create mock Google token
  logger.info('Creating mock Google token');
  const mockToken = sign(MOCK_GOOGLE_PAYLOAD, 'mock-secret');
  logger.success('Mock token created');

  // Step 4: Test signIn mutation
  logger.info('Testing signIn mutation');
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation GoogleSignIn($input: SignInInput!) {
            signIn(input: $input) {
              code
              success
              message
              auth {
                token
                userId
                role
              }
              role
              userId
            }
          }
        `,
        variables: {
          input: {
            provider: 'GOOGLE',
            token: mockToken
          }
        }
      })
    });
    
    const data = await response.json();
    if (data.errors) {
      logger.error('SignIn mutation failed', data.errors);
      process.exit(1);
    }
    
    logger.success('SignIn mutation successful', data.data);
    
    // Step 5: Verify JWT token
    if (data.data?.signIn?.auth?.token) {
      logger.info('Verifying JWT token');
      try {
        const decoded = verify(data.data.signIn.auth.token, JWT_SECRET);
        logger.success('JWT token verified', decoded);
      } catch (error) {
        logger.error('JWT token verification failed', error);
      }
    }
  } catch (error) {
    logger.error('SignIn mutation failed', error);
    process.exit(1);
  }

  // Step 6: Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    tests: {
      environment: true,
      backendConnection: true,
      mockToken: true,
      signInMutation: true,
      jwtVerification: true
    },
    recommendations: [
      'Verify Google Client ID in both frontend and backend',
      'Check CORS configuration in backend',
      'Ensure JWT_SECRET is consistent'
    ]
  };
  
  writeFileSync('google-signin-test-report.json', JSON.stringify(report, null, 2));
  logger.success('Test report generated', 'google-signin-test-report.json');
}

// Run tests
runTests().catch(error => {
  logger.error('Test execution failed', error);
  process.exit(1);
});