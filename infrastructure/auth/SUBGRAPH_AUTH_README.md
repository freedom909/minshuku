# Subgraph Authentication System

## Overview

The Subgraph Authentication System provides a secure and flexible authentication mechanism for federated GraphQL architectures. It handles both user authentication and service-to-service communication within the federation.

## Features

- JWT-based authentication
- Service-to-service authentication
- Role-based access control
- Permission-based authorization
- GraphQL directive for protecting fields and types
- Middleware for Express/Apollo Server integration

## Installation

The authentication system is part of the infrastructure package. No additional installation is required.

## Configuration

### Environment Variables

```env
JWT_SECRET=your-jwt-secret-key
TOKEN_EXPIRATION=24h
```

### Service Configuration

```javascript
const config = {
  jwtSecret: process.env.JWT_SECRET,
  allowedServices: ['users-service', 'bookings-service', 'listings-service'],
};

const authService = new SubgraphAuthService(config);
```

## Usage

### 1. Setting up a Subgraph

```javascript
import { createSubgraphServer } from './auth/subgraphAuth.js';

const typeDefs = gql`
  type Query {
    protected: String @auth(requires: { auth: true })
    adminOnly: String @auth(requires: { role: "ADMIN" })
  }
`;

const resolvers = {
  Query: {
    protected: () => 'This is protected data',
    adminOnly: () => 'This is admin only data',
  },
};

const server = createSubgraphServer(typeDefs, resolvers, {
  jwtSecret: process.env.JWT_SECRET,
  allowedServices: ['service1', 'service2'],
});
```

### 2. Protecting Resources

#### Using the @auth Directive

```graphql
type Query {
  # Requires authentication
  profile: Profile @auth(requires: { auth: true })
  
  # Requires specific role
  adminDashboard: Dashboard @auth(requires: { role: "ADMIN" })
  
  # Requires specific permission
  sensitiveData: Data @auth(requires: { permission: "READ_SENSITIVE" })
}
```

#### Using Context in Resolvers

```javascript
const resolvers = {
  Query: {
    customProtectedField: async (_, args, context) => {
      // Custom authorization logic
      if (!context.auth.isAuthenticated) {
        throw new AuthenticationError('Authentication required');
      }
      
      // Access check
      await context.auth.validateAccess({ permission: 'CUSTOM_PERMISSION' });
      
      return 'Protected data';
    },
  },
};
```

### 3. Service-to-Service Communication

```javascript
// Service A
const serviceToken = authService.createServiceToken('service-a');

// Making request to Service B
const response = await fetch('http://service-b/graphql', {
  headers: {
    'x-service-token': serviceToken,
  },
});
```

## Security Considerations

### Token Security

1. Always use HTTPS for production environments
2. Keep JWT_SECRET secure and unique per environment
3. Use short-lived tokens for service-to-service communication
4. Rotate secrets periodically

### Authorization Best Practices

1. Always validate both authentication and authorization
2. Use principle of least privilege
3. Implement rate limiting
4. Log security-relevant events

### Common Pitfalls to Avoid

1. Don't store sensitive data in tokens
2. Don't trust client-side token validation
3. Don't skip validation for internal services
4. Don't use long-lived tokens

## Integration with Existing Services

### 1. Express Middleware Integration

```javascript
import { SubgraphAuthService } from './auth/subgraphAuth.js';

const app = express();
const authService = new SubgraphAuthService(config);

app.use(authService.subgraphAuthMiddleware);
```

### 2. Apollo Server Integration

```javascript
import { ApolloServer } from 'apollo-server';
import { SubgraphAuthService } from './auth/subgraphAuth.js';

const authService = new SubgraphAuthService(config);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authService.createContext,
});
```

### 3. Adding to Existing Subgraphs

```javascript
// Existing subgraph
const existingServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Merge with existing context
    const authContext = authService.createContext({ req });
    return {
      ...existingContext,
      ...authContext,
    };
  },
});
```

## Testing

The authentication system includes comprehensive tests. Run them using:

```bash
npm test infrastructure/auth/subgraphAuth.test.js
```

## Troubleshooting

### Common Issues

1. Invalid Token
```javascript
// Error: Invalid token
// Solution: Check token expiration and signature
const token = authService.validateToken(receivedToken);
```

2. Service Not Authorized
```javascript
// Error: Service not authorized
// Solution: Add service to allowedServices in config
const config = {
  allowedServices: ['your-service-id', ...otherServices],
};
```

3. Missing Permissions
```javascript
// Error: Permission required
// Solution: Ensure user has required permissions
await authService.validateAccess(context, { permission: 'REQUIRED_PERMISSION' });
```

## Contributing

When contributing to the authentication system:

1. Add tests for any new functionality
2. Update documentation for any changes
3. Follow existing code style and patterns
4. Consider backward compatibility

## Support

For issues and questions:

1. Check the troubleshooting guide above
2. Review the test cases for examples
3. Contact the infrastructure team