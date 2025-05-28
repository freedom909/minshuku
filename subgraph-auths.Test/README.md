# Subgraph Authentication Tests

This directory contains comprehensive test suites for the subgraph authentication system. The tests cover unit testing, integration testing, performance testing, and security testing aspects of the authentication system.

## Test Structure

The test suite is organized into four main categories:

1. **Unit Tests** (`unit.test.js`): Tests individual components and functions in isolation.
   - Token validation
   - Permission checks
   - OAuth authentication

2. **Integration Tests** (`integration.test.js`): Tests how different components work together.
   - Complete authentication flow
   - Token generation and validation flow
   - Role-based access control
   - Session management

3. **Performance Tests** (`performance.test.js`): Tests the system's performance under various conditions.
   - Authentication response time
   - Concurrent authentication requests
   - Token validation performance
   - Load testing
   - Memory usage

4. **Security Tests** (`security.test.js`): Tests the system's security features.
   - Token security (tampering, expiration)
   - Input validation and sanitization
   - Authorization controls
   - Rate limiting and brute force protection
   - CSRF protection
   - Secure headers

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

Install the dependencies:

```bash
npm install
```

or

```bash
yarn install
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run specific test categories

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

### Generate test coverage report

```bash
npm run test:coverage
```

The coverage report will be generated in the `coverage` directory.

## Test Coverage Requirements

The test suite aims to maintain at least 80% code coverage across:
- Branches
- Functions
- Lines
- Statements

## Best Practices

When adding new features to the authentication system, follow these testing best practices:

1. Write tests before implementing features (Test-Driven Development)
2. Ensure each test focuses on a single aspect of functionality
3. Use descriptive test names that explain what is being tested
4. Mock external dependencies to ensure tests are isolated
5. Regularly run the full test suite to catch regressions

## Continuous Integration

These tests are integrated into the CI/CD pipeline and run automatically on each pull request to the `subgraph-auths` branch.