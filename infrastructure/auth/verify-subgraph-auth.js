#!/usr/bin/env node

import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import ora from 'ora';
import { SubgraphAuthService } from './subgraphAuth.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class SubgraphAuthVerifier {
  constructor(config = {}) {
    this.config = {
      userServiceUrl: 'http://localhost:4010',
      bookingServiceUrl: 'http://localhost:4002',
      jwtSecret: process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string',
      ...config,
    };

    this.authService = new SubgraphAuthService({
      jwtSecret: this.config.jwtSecret,
      allowedServices: ['test-service'],
    });
  }

  async verifyServiceHealth() {
    const spinner = ora('Verifying service health').start();
    
    try {
      // Check User Service
      await fetch(this.config.userServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });

      // Check Booking Service
      await fetch(this.config.bookingServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '{ __typename }' }),
      });

      spinner.succeed('Services are healthy');
      return true;
    } catch (error) {
      spinner.fail(`Service health check failed: ${error.message}`);
      return false;
    }
  }

  async testUserAuthentication() {
    const spinner = ora('Testing user authentication').start();

    try {
      // Create test user token
      const userToken = jwt.sign(
        { id: 'test-user', role: 'USER' },
        this.config.jwtSecret
      );

      // Test authenticated query
      const response = await fetch(this.config.userServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          query: `
            query {
              me {
                id
                username
              }
            }
          `,
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      spinner.succeed('User authentication working');
      return true;
    } catch (error) {
      spinner.fail(`User authentication test failed: ${error.message}`);
      return false;
    }
  }

  async testServiceAuthentication() {
    const spinner = ora('Testing service-to-service authentication').start();

    try {
      // Create service token
      const serviceToken = this.authService.createServiceToken('test-service');

      // Test service-to-service communication
      const response = await fetch(this.config.bookingServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-service-token': serviceToken,
        },
        body: JSON.stringify({
          query: `
            query {
              __typename
            }
          `,
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      spinner.succeed('Service-to-service authentication working');
      return true;
    } catch (error) {
      spinner.fail(`Service authentication test failed: ${error.message}`);
      return false;
    }
  }

  async testAuthorizationRules() {
    const spinner = ora('Testing authorization rules').start();

    try {
      // Test cases for different roles and permissions
      const testCases = [
        {
          role: 'USER',
          query: '{ myBookings { id } }',
          expectSuccess: true,
        },
        {
          role: 'USER',
          query: '{ hostBookings { id } }',
          expectSuccess: false,
        },
        {
          role: 'HOST',
          query: '{ hostBookings { id } }',
          expectSuccess: true,
        },
        {
          role: 'ADMIN',
          query: '{ allUserDetails { user { id } } }',
          expectSuccess: true,
        },
      ];

      for (const testCase of testCases) {
        const token = jwt.sign(
          { id: 'test-user', role: testCase.role },
          this.config.jwtSecret
        );

        const response = await fetch(
          testCase.role === 'ADMIN' ? this.config.userServiceUrl : this.config.bookingServiceUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query: testCase.query }),
          }
        );

        const data = await response.json();
        const success = !data.errors;

        if (success !== testCase.expectSuccess) {
          throw new Error(
            `Authorization test failed for role ${testCase.role}: ` +
            `expected ${testCase.expectSuccess}, got ${success}`
          );
        }
      }

      spinner.succeed('Authorization rules working');
      return true;
    } catch (error) {
      spinner.fail(`Authorization test failed: ${error.message}`);
      return false;
    }
  }

  async testFederationSetup() {
    const spinner = ora('Testing federation setup').start();

    try {
      // Test federated query
      const response = await fetch(this.config.bookingServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt.sign(
            { id: 'test-user', role: 'USER' },
            this.config.jwtSecret
          )}`,
        },
        body: JSON.stringify({
          query: `
            query {
              myBookings {
                id
                user {
                  id
                  username
                }
              }
            }
          `,
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      spinner.succeed('Federation setup working');
      return true;
    } catch (error) {
      spinner.fail(`Federation test failed: ${error.message}`);
      return false;
    }
  }

  printSummary(results) {
    console.log('\n=== Verification Summary ===\n');
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? 
        chalk.green('✓ PASSED') : 
        chalk.red('✗ FAILED');
      
      console.log(`${status} ${test}`);
    });
  }

  async verifyAll() {
    console.log(chalk.blue('\nStarting Subgraph Authentication Verification\n'));

    // Wait for services to be ready
    await sleep(2000);

    const results = {
      'Service Health': await this.verifyServiceHealth(),
      'User Authentication': await this.testUserAuthentication(),
      'Service Authentication': await this.testServiceAuthentication(),
      'Authorization Rules': await this.testAuthorizationRules(),
      'Federation Setup': await this.testFederationSetup(),
    };

    this.printSummary(results);

    const allPassed = Object.values(results).every(Boolean);
    
    if (allPassed) {
      console.log(chalk.green('\n✨ All verifications passed!\n'));
      return true;
    } else {
      console.log(chalk.red('\n❌ Some verifications failed. Please check the summary above.\n'));
      return false;
    }
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  const verifier = new SubgraphAuthVerifier({
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:4010',
    bookingServiceUrl: process.env.BOOKING_SERVICE_URL || 'http://localhost:4002',
    jwtSecret: process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string',
  });

  verifier.verifyAll().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export default SubgraphAuthVerifier;