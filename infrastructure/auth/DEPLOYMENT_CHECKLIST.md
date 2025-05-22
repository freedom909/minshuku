# Account Locking System Deployment Checklist

## Pre-Deployment Checks

### 1. Redis Configuration
- [ ] Redis server is installed and running
- [ ] Connection URL is correct in environment variables
- [ ] Authentication is configured if needed
- [ ] Memory limits are properly set
- [ ] Persistence is configured if needed

### 2. Environment Variables
- [ ] `REDIS_URL` is set
- [ ] `MAX_LOGIN_ATTEMPTS` is set (recommended: 5)
- [ ] `ACCOUNT_LOCK_DURATION` is set (recommended: 900 seconds)
- [ ] `JWT_SECRET` is set and secure

### 3. Service Integration
- [ ] AccountLockService is initialized in auth service
- [ ] `isAccountLocked()` check is implemented before authentication
- [ ] `recordFailedAttempt()` is called after failed logins
- [ ] `clearLock()` is called after successful logins
- [ ] Error handling is implemented for Redis failures

## Testing Procedures

### 1. Unit Tests
- [ ] AccountLockService unit tests pass
```bash
npm test infrastructure/auth/accountLockService.test.js
```

### 2. Integration Tests
- [ ] Authentication service tests with locking pass
```bash
npm test auth.integration.test.js
```

### 3. Manual Tests
- [ ] Test account locks after configured attempts
- [ ] Test lock expiration after configured duration
- [ ] Test successful login clears lock
- [ ] Test Redis failure behavior (fail open)

## Performance Testing

### 1. Load Testing
- [ ] Run performance test with expected user load
```bash
node infrastructure/auth/performanceTest.js 5000 5
```
- Verify:
  - Throughput > 100 requests/second
  - Error rate < 1%
  - Redis memory usage within limits

### 2. Concurrency Testing
- [ ] Test simultaneous login attempts
- Verify:
  - No race conditions
  - Correct lock count
  - No duplicate locks

## Monitoring Setup

### 1. Metrics Collection
- [ ] Failed login attempts counter
- [ ] Account locks counter
- [ ] Lock duration histogram
- [ ] Redis performance metrics

### 2. Alerting Rules
- [ ] High failed attempt rate
- [ ] Unusual lock patterns
- [ ] Redis connection issues
- [ ] Lock duration anomalies

## Rollout Plan

### 1. Staging Deployment
- [ ] Deploy to staging environment
- [ ] Monitor for 48 hours
- [ ] Verify all test cases

### 2. Production Deployment
- [ ] Deploy during low-traffic period
- [ ] Enable feature flag
- [ ] Monitor closely for 24 hours
- [ ] Gradually increase traffic

## Rollback Plan

### 1. Immediate Issues
- [ ] Disable via feature flag
- [ ] Clear all locks if needed
```bash
./manage-locks.sh clear
```

### 2. Redis Issues
- [ ] Fallback to in-memory locking
- [ ] Disable locking temporarily

## Post-Deployment

### 1. Verification
- [ ] Check logs for locking activity
- [ ] Verify metrics are collected
- [ ] Test real user login flows

### 2. Documentation
- [ ] Update runbooks with lock management procedures
- [ ] Document monitoring dashboards
- [ ] Train support team on lock management

## Maintenance

### Regular Checks
- [ ] Review lock statistics weekly
- [ ] Monitor Redis memory usage
- [ ] Verify backup procedures

### Scaling Considerations
- [ ] Redis cluster for high availability
- [ ] Regional replication if needed
- [ ] Load test with 2x expected traffic

## Security Review
- [ ] Penetration testing completed
- [ ] Rate limiting in place
- [ ] No user enumeration in errors
- [ ] Secure Redis configuration
```