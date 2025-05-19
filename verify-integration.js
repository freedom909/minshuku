/**
 * Google Sign-In Integration Verification Script
 * 
 * Run after starting services to verify the complete auth flow
 * 
 * Usage:
 * 1. Run: node start-auth-services.js
 * 2. Then run: node verify-integration.js
 */

const fetch = require('node-fetch');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:4001/graphql';
const FRONTEND_URL = 'http://localhost:3000';
const TEST_REPORT_FILE = 'integration-test-report.json';

// Logger
const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  success: (message) => console.log(`[SUCCESS] ${message}`)
};

// Test cases
const testCases = [
  {
    name: 'Backend Health Check',
    test: async () => {
      const response = await fetch(`${BACKEND_URL}/health`);
      if (!response.ok) throw new Error('Backend not healthy');
      return await response.json();
    }
  },
  {
    name: 'Frontend Availability',
    test: async () => {
      const response = await fetch(FRONTEND_URL);
      if (!response.ok) throw new Error('Frontend not available');
      return { status: response.status };
    }
  },
  {
    name: 'Google Sign-In Mutation',
    test: async () => {
      // Create mock Google token
      const client = new OAuth2Client('mock-client-id');
      const ticket = {
        getPayload: () => ({
          sub: 'mock-user-id',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg'
        })
      };
      client.verifyIdToken = () => Promise.resolve(ticket);

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation GoogleSignIn($input: SignInInput!) {
              signIn(input: $input) {
                code
                success
                auth {
                  token
                  userId
                  role
                }
              }
            }
          `,
          variables: {
            input: {
              provider: 'GOOGLE',
              token: 'mock-token'
            }
          }
        })
      });

      const data = await response.json();
      if (data.errors) throw new Error(data.errors[0].message);
      if (!data.data.signIn.success) throw new Error('SignIn failed');
      return data.data.signIn;
    }
  },
  {
    name: 'Frontend-Backend Integration',
    test: async () => {
      const response = await fetch(`${FRONTEND_URL}/api/auth-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    }
  }
];

// Run verification tests
async function verifyIntegration() {
  const report = {
    timestamp: new Date().toISOString(),
    services: {
      backend: BACKEND_URL,
      frontend: FRONTEND_URL
    },
    tests: {},
    status: 'PASSED'
  };

  logger.info('Starting integration verification...');

  for (const testCase of testCases) {
    try {
      logger.info(`Running test: ${testCase.name}`);
      const result = await testCase.test();
      report.tests[testCase.name] = {
        status: 'PASSED',
        result
      };
      logger.success(`${testCase.name} - PASSED`);
    } catch (error) {
      report.tests[testCase.name] = {
        status: 'FAILED',
        error: error.message
      };
      report.status = 'FAILED';
      logger.error(`${testCase.name} - FAILED: ${error.message}`);
    }
  }

  // Save test report
  fs.writeFileSync(TEST_REPORT_FILE, JSON.stringify(report, null, 2));
  logger.success(`Test report saved to ${TEST_REPORT_FILE}`);

  // Print summary
  console.log('\n=== TEST SUMMARY ===');
  console.log(`Status: ${report.status}`);
  console.log('Test Results:');
  for (const [name, test] of Object.entries(report.tests)) {
    console.log(`- ${name}: ${test.status}`);
    if (test.status === 'FAILED') {
      console.log(`  Reason: ${test.error}`);
    }
  }

  process.exit(report.status === 'PASSED' ? 0 : 1);
}

verifyIntegration().catch(error => {
  logger.error(`Verification failed: ${error.message}`);
  process.exit(1);
});