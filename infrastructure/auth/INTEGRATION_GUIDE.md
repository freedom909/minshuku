# Account Lock Service Integration Guide

## Overview

This guide explains how to integrate the AccountLockService into your authentication system to protect against brute force attacks. The service temporarily locks accounts after multiple failed login attempts.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Basic Integration](#basic-integration)
4. [Advanced Integration](#advanced-integration)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

- Redis server (v5.0+)
- Node.js (v14+)
- Authentication system with email/password login

## Installation

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install redis-server
   
   # macOS
   brew install redis
   brew services start redis
   ```

2. **Install required packages**:
   ```bash
   npm install ioredis
   ```

3. **Configure environment variables**:
   ```env
   REDIS_URL=redis://localhost:6379
   REDIS_PASSWORD=
   MAX_LOGIN_ATTEMPTS=5
   ACCOUNT_LOCK_DURATION=900  # 15 minutes in seconds
   ```

## Basic Integration

### Step 1: Initialize the service

```javascript
import AccountLockService from './accountLockService.js';

// Initialize in your authentication service
const accountLockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockDuration: parseInt(process.env.ACCOUNT_LOCK_DURATION || '900', 10)
});
```

### Step 2: Check for locked accounts before authentication

```javascript
async function authenticate(email, password) {
  // Check if account is locked
  const isLocked = await accountLockService.isAccountLocked(email);
  if (isLocked) {
    const details = await accountLockService.getLockDetails(email);
    throw new Error(`Account locked. Try again in ${Math.ceil(details.remainingTime / 60)} minutes.`);
  }

  // Proceed with normal authentication
  const user = await findUserByEmail(email);
  if (!user || !validatePassword(password, user.password)) {
    // Record failed attempt
    const result = await accountLockService.recordFailedAttempt(email);
    
    // Check if account is now locked
    if (result.locked) {
      throw new Error('Account locked due to too many failed attempts.');
    } else {
      throw new Error(`Invalid credentials. ${result.remainingAttempts} attempts remaining.`);
    }
  }

  // Clear failed attempts on successful login
  await accountLockService.clearLock(email);
  
  return user;
}
```

## Advanced Integration

### GraphQL Resolver Integration

```javascript
const resolvers = {
  Mutation: {
    signIn: async (_, { input }, { dataSources }) => {
      try {
        // Check if account is locked
        if (input.email) {
          const isLocked = await accountLockService.isAccountLocked(input.email);
          if (isLocked) {
            const details = await accountLockService.getLockDetails(input.email);
            throw new GraphQLError('Account temporarily locked', {
              extensions: { 
                code: 'ACCOUNT_LOCKED',
                remainingTime: details.remainingTime
              }
            });
          }
        }

        // Attempt authentication
        const user = await dataSources.userService.authenticate(input);
        
        if (!user) {
          // Record failed attempt
          const result = await accountLockService.recordFailedAttempt(input.email);
          throw new GraphQLError('Invalid credentials', {
            extensions: { 
              code: 'INVALID_CREDENTIALS',
              remainingAttempts: result.remainingAttempts
            }
          });
        }

        // Clear failed attempts on successful login
        await accountLockService.clearLock(input.email);
        
        // Generate token and return success
        return {
          success: true,
          token: generateToken(user),
          user
        };
      } catch (error) {
        // Handle and format errors
        return {
          success: false,
          message: error.message
        };
      }
    }
  }
};
```

### REST API Integration

```javascript
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if account is locked
    const isLocked = await accountLockService.isAccountLocked(email);
    if (isLocked) {
      const details = await accountLockService.getLockDetails(email);
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked',
        remainingTime: details.remainingTime
      });
    }
    
    // Attempt authentication
    const user = await userService.authenticate(email, password);
    
    if (!user) {
      // Record failed attempt
      const result = await accountLockService.recordFailedAttempt(email);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        remainingAttempts: result.remainingAttempts
      });
    }
    
    // Clear failed attempts on successful login
    await accountLockService.clearLock(email);
    
    // Generate token and return success
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});
```

## Frontend Integration

### Handling Lock Status in UI

```javascript
async function handleLogin(email, password) {
  try {
    const response = await api.post('/login', { email, password });
    // Handle successful login
    redirectToDashboard();
  } catch (error) {
    if (error.response?.status === 423) {
      // Account locked
      const remainingMinutes = Math.ceil(error.response.data.remainingTime / 60);
      setError(`Account temporarily locked. Try again in ${remainingMinutes} minutes.`);
    } else if (error.response?.data?.remainingAttempts) {
      // Failed attempt with remaining attempts
      setError(`Invalid credentials. ${error.response.data.remainingAttempts} attempts remaining.`);
    } else {
      // Other error
      setError('Login failed. Please try again.');
    }
  }
}
```

### React Component Example

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [lockTime, setLockTime] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/login', { email, password });
      // Handle successful login
      localStorage.setItem('token', response.data.token);
      window.location.href = '/dashboard';
    } catch (error) {
      if (error.response?.status === 423) {
        // Account locked
        const remainingMinutes = Math.ceil(error.response.data.remainingTime / 60);
        setLockTime(remainingMinutes);
        setError(`Account temporarily locked. Try again in ${remainingMinutes} minutes.`);
      } else if (error.response?.data?.remainingAttempts) {
        // Failed attempt with remaining attempts
        setRemainingAttempts(error.response.data.remainingAttempts);
        setError(`Invalid credentials. ${error.response.data.remainingAttempts} attempts remaining.`);
      } else {
        // Other error
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      {error && (
        <div className="error-message">
          {error}
          {lockTime && (
            <div className="lock-timer">
              Account locked. Try again later.
            </div>
          )}
          {remainingAttempts && (
            <div className="attempt-counter">
              {remainingAttempts} attempts remaining
            </div>
          )}
        </div>
      )}
      
      <button type="submit" disabled={loading || lockTime}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Testing

### Manual Testing

Use the provided test script:

```bash
# Test with default values
node test-account-lock.js

# Test with specific email and attempts
node test-account-lock.js test@example.com 6
```

### Automated Testing

```javascript
describe('Account Locking', () => {
  let lockService;
  
  beforeEach(() => {
    lockService = new AccountLockService({
      maxAttempts: 3,
      lockDuration: 60
    });
  });
  
  afterEach(async () => {
    await lockService.clearLock('test@example.com');
    await lockService.close();
  });
  
  test('should lock account after max attempts', async () => {
    // Record 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await lockService.recordFailedAttempt('test@example.com');
    }
    
    const isLocked = await lockService.isAccountLocked('test@example.com');
    expect(isLocked).toBe(true);
  });
  
  test('should clear lock after successful login', async () => {
    // Record 3 failed attempts
    for (let i = 0; i < 3; i++) {
      await lockService.recordFailedAttempt('test@example.com');
    }
    
    // Clear lock
    await lockService.clearLock('test@example.com');
    
    const isLocked = await lockService.isAccountLocked('test@example.com');
    expect(isLocked).toBe(false);
  });
});
```

## Monitoring

Use the provided monitoring script:

```bash
# Start monitoring
node monitor-locks.js
```

### Integration with Monitoring Systems

```javascript
// Example: Prometheus metrics
const promClient = require('prom-client');

// Create metrics
const failedLoginCounter = new promClient.Counter({
  name: 'failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['email']
});

const accountLocksCounter = new promClient.Counter({
  name: 'account_locks_total',
  help: 'Total number of account locks',
  labelNames: ['email']
});

// Instrument the account lock service
async function authenticate(email, password) {
  try {
    // Check if account is locked
    const isLocked = await accountLockService.isAccountLocked(email);
    if (isLocked) {
      accountLocksCounter.inc({ email });
      throw new Error('Account locked');
    }
    
    // Attempt authentication
    const user = await userService.authenticate(email, password);
    
    if (!user) {
      failedLoginCounter.inc({ email });
      const result = await accountLockService.recordFailedAttempt(email);
      
      if (result.locked) {
        accountLocksCounter.inc({ email });
      }
      
      throw new Error('Invalid credentials');
    }
    
    // Clear failed attempts on successful login
    await accountLockService.clearLock(email);
    
    return user;
  } catch (error) {
    throw error;
  }
}
```

## Troubleshooting

### Common Issues

1. **Redis Connection Issues**
   - Check Redis is running: `redis-cli ping`
   - Verify connection URL: `redis-cli -u redis://localhost:6379`
   - Check Redis memory: `redis-cli info memory`

2. **Lock Not Clearing**
   - Manually clear locks: `redis-cli keys "auth:lockout:*" | xargs redis-cli del`
   - Check Redis TTL: `redis-cli ttl "auth:lockout:email@example.com"`

3. **Performance Issues**
   - Monitor Redis latency: `redis-cli --latency`
   - Check connection pool settings

### Debugging

```javascript
// Enable debug mode
const lockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: 5,
  lockDuration: 900,
  debug: true
});

// Log all operations
lockService.on('debug', (message) => {
  console.log(`[AccountLockService] ${message}`);
});
```

### Management Script

Use the provided management script:

```bash
# Show help
./manage-locks.sh help

# Monitor locks
./manage-locks.sh monitor

# Test locking
./manage-locks.sh test user@example.com 6

# Clear all locks
./manage-locks.sh clear

# Check status for an email
./manage-locks.sh status user@example.com
```