# Account Lock Service Documentation

## Overview
The Account Lock Service provides security against brute force attacks by implementing temporary account locking after multiple failed login attempts.

## Features
- Configurable maximum login attempts
- Automatic account locking
- Redis-based lock storage
- Configurable lock duration
- Automatic unlock after timeout

## Setup

### 1. Environment Variables
```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Account Security Settings
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=900  # 15 minutes in seconds
```

### 2. Installation
Ensure Redis is installed and running:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis
brew services start redis

# Windows
# Download from https://redis.io/download
```

### 3. Basic Usage
```javascript
import AccountLockService from './accountLockService.js';

// Initialize service
const lockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: 5,
  lockDuration: 900 // 15 minutes
});

// Check if account is locked
const isLocked = await lockService.isAccountLocked('user@example.com');

// Record failed attempt
const result = await lockService.recordFailedAttempt('user@example.com');

// Clear lock
await lockService.clearLock('user@example.com');
```

## Testing

### 1. Run Test Script
```bash
# Test with default values
node test-account-lock.js

# Test with specific email and attempts
node test-account-lock.js test@example.com 6
```

### 2. Run Unit Tests
```bash
npm test infrastructure/auth/accountLockService.test.js
```

## API Reference

### Constructor Options
```javascript
{
  redisUrl: string,      // Redis connection URL
  maxAttempts: number,   // Maximum allowed attempts before locking
  lockDuration: number,  // Lock duration in seconds
  namespace: string      // Redis key namespace (optional)
}
```

### Methods

#### `isAccountLocked(email)`
Checks if an account is currently locked.
- **Parameters**: `email: string`
- **Returns**: `Promise<boolean>`

#### `recordFailedAttempt(email)`
Records a failed login attempt and potentially locks the account.
- **Parameters**: `email: string`
- **Returns**: `Promise<{
    locked: boolean,
    attempts: number,
    remainingAttempts?: number,
    remainingTime?: number
  }>`

#### `clearLock(email)`
Removes the lock from an account.
- **Parameters**: `email: string`
- **Returns**: `Promise<boolean>`

#### `getLockDetails(email)`
Gets detailed information about the account's lock status.
- **Parameters**: `email: string`
- **Returns**: `Promise<{
    isLocked: boolean,
    attempts: number,
    remainingTime: number,
    remainingAttempts: number
  }>`

## Integration Example

### With GraphQL Resolver
```javascript
const resolvers = {
  Mutation: {
    signIn: async (_, { input }, { dataSources }) => {
      // Check if account is locked
      const isLocked = await lockService.isAccountLocked(input.email);
      if (isLocked) {
        const details = await lockService.getLockDetails(input.email);
        throw new GraphQLError('Account temporarily locked', {
          extensions: { 
            code: 'ACCOUNT_LOCKED',
            remainingTime: details.remainingTime
          }
        });
      }

      try {
        // Attempt authentication
        const result = await authenticate(input);
        if (result.success) {
          // Clear any failed attempts on success
          await lockService.clearLock(input.email);
          return result;
        }

        // Record failed attempt
        const lockResult = await lockService.recordFailedAttempt(input.email);
        throw new GraphQLError('Authentication failed', {
          extensions: {
            remainingAttempts: lockResult.remainingAttempts
          }
        });
      } catch (error) {
        // Handle errors...
      }
    }
  }
};
```

## Error Handling
The service includes graceful error handling:
- Redis connection errors default to failing open
- Invalid inputs throw appropriate errors
- All async operations are properly caught and logged

## Best Practices
1. Always clear locks after successful authentication
2. Use appropriate lock duration (recommended: 15 minutes)
3. Set reasonable maximum attempts (recommended: 5)
4. Monitor failed login attempts
5. Implement proper logging
6. Consider rate limiting in addition to account locking

## Monitoring
Monitor these metrics for security insights:
- Number of locked accounts
- Failed login attempts per account
- Lock duration patterns
- Success rate of authentication attempts

## Troubleshooting
1. **Redis Connection Issues**
   - Verify Redis is running
   - Check connection URL
   - Ensure proper Redis authentication

2. **Lock Not Clearing**
   - Verify Redis key expiration
   - Check clearLock implementation
   - Monitor Redis memory usage

3. **Performance Issues**
   - Monitor Redis response times
   - Check network latency
   - Consider Redis clustering for scale