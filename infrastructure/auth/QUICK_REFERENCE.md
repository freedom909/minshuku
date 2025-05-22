# Account Locking System Quick Reference

## Key Commands

### Service Management
```bash
# Start Redis server
redis-server

# Start monitoring dashboard
node monitor-locks.js

# Run performance test (users, attempts)
node performanceTest.js 1000 5

# Run integration tests
npm test infrastructure/auth/accountLockService.test.js
```

### Lock Management
```bash
# Check lock status for an email
redis-cli get "auth:lockout:user@example.com"

# Clear specific lock
redis-cli del "auth:lockout:user@example.com"

# Clear all locks
redis-cli keys "auth:lockout:*" | xargs redis-cli del

# Check remaining lock time
redis-cli ttl "auth:lockout:user@example.com"
```

### Using Management Script
```bash
# Start interactive monitor
./manage-locks.sh monitor

# Test locking for an email
./manage-locks.sh test user@example.com 6

# Clear all locks
./manage-locks.sh clear

# Check lock status
./manage-locks.sh status user@example.com
```

## Configuration Reference

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
| `REDIS_PASSWORD` | - | Redis auth password |
| `MAX_LOGIN_ATTEMPTS` | 5 | Failed attempts before lock |
| `ACCOUNT_LOCK_DURATION` | 900 | Lock duration in seconds (15 min) |
| `LOCK_KEY_PREFIX` | `auth:lockout:` | Redis key prefix |

### AccountLockService Options
```javascript
{
  redisUrl: 'redis://localhost:6379', // Redis connection URL
  maxAttempts: 5,                    // Max failed attempts
  lockDuration: 900,                  // Lock duration in seconds
  namespace: 'auth:lockout:',         // Redis key prefix
  debug: false                        // Enable debug logging
}
```

## API Reference

### `AccountLockService` Methods
```javascript
// Check if account is locked
async isAccountLocked(email: string): Promise<boolean>

// Record failed attempt
async recordFailedAttempt(email: string): Promise<{
  locked: boolean,
  attempts: number,
  remainingAttempts?: number,
  remainingTime?: number
}>

// Clear account lock
async clearLock(email: string): Promise<boolean>

// Get lock details
async getLockDetails(email: string): Promise<{
  isLocked: boolean,
  attempts: number,
  remainingTime: number,
  remainingAttempts: number
}>
```

## Error Codes

### Common Error Responses
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `ACCOUNT_LOCKED` | 423 | Account is temporarily locked |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOO_MANY_REQUESTS` | 429 | Rate limiting triggered |
| `SERVICE_UNAVAILABLE` | 503 | Redis/service unavailable |

## Monitoring Metrics

### Key Metrics to Track
- `auth_lock_attempts_total`
- `auth_lock_events_total`
- `auth_lock_duration_seconds`
- `redis_commands_processed`
- `redis_memory_usage`

## Troubleshooting Tips

1. **Account not locking**
   - Verify Redis connection
   - Check `MAX_LOGIN_ATTEMPTS` value
   - Monitor `recordFailedAttempt()` calls

2. **Lock not clearing**
   - Check Redis TTL with `redis-cli ttl`
   - Verify `clearLock()` is called on success

3. **Performance issues**
   - Check Redis memory usage
   - Monitor Redis CPU load
   - Verify connection pooling

## Quick Recovery

1. **Emergency unlock**
```bash
redis-cli del "auth:lockout:user@example.com"
```

2. **Disable locking temporarily**
```javascript
// In auth service
const lockService = new AccountLockService({
  maxAttempts: 1000 // Effectively disable locking
});
```