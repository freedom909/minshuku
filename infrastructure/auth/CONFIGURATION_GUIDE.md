# Account Locking System Configuration Guide

## Table of Contents
1. [Basic Configuration](#basic-configuration)
2. [Environment-Specific Settings](#environment-specific-settings)
3. [Performance Tuning](#performance-tuning)
4. [Security Considerations](#security-considerations)
5. [Monitoring Setup](#monitoring-setup)
6. [Troubleshooting](#troubleshooting)

## Basic Configuration

### Minimum Required Settings
```env
# Redis connection
REDIS_URL=redis://localhost:6379

# Locking behavior
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=900  # 15 minutes in seconds
```

### Recommended Production Settings
```env
# Redis with authentication
REDIS_URL=redis://:password@redis-host:6379/0

# Security tuning
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=900  # 15 minutes
PASSWORD_HASH_ROUNDS=12

# Monitoring
STATS_INTERVAL=60  # Seconds between stats collection
```

## Environment-Specific Settings

### Development Environment
```env
# Faster iteration with shorter lock times
MAX_LOGIN_ATTEMPTS=3
ACCOUNT_LOCK_DURATION=60  # 1 minute

# Local Redis
REDIS_URL=redis://localhost:6379
```

### Staging Environment
```env
# Simulate production but with shorter durations
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=300  # 5 minutes

# Shared Redis
REDIS_URL=redis://staging-redis:6379
```

### Production Environment
```env
# Conservative settings
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION=1800  # 30 minutes

# High availability Redis
REDIS_URL=redis://cluster-redis:6379,redis://cluster-redis-replica:6379
```

## Performance Tuning

### Redis Configuration
```redis
# redis.conf
maxmemory 1gb
maxmemory-policy allkeys-lru
timeout 300  # 5 minute connection timeout
tcp-keepalive 60
```

### AccountLockService Tuning
```javascript
// High-traffic application settings
const lockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: 5,
  lockDuration: 900,
  
  // Performance options
  redisOptions: {
    connectTimeout: 5000,  // 5 second timeout
    retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
    maxRetriesPerRequest: 3
  }
});
```

### Recommended Settings by Traffic Level

| Traffic Level | MAX_ATTEMPTS | LOCK_DURATION | Redis Connections |
|--------------|-------------|--------------|-------------------|
| Low (<100 RPM) | 5 | 900s | 10 |
| Medium (100-1k RPM) | 5 | 600s | 25 |
| High (1k+ RPM) | 5 | 300s | 50+ |

## Security Considerations

### Recommended Security Settings
```env
# Always use password-protected Redis in production
REDIS_PASSWORD=complex-password-here

# Rotate these periodically
JWT_SECRET=secure-random-string-here

# Consider IP-based rate limiting
ALLOWED_ATTEMPTS_PER_IP=50
```

### Secure Redis Configuration
1. Enable Redis authentication
2. Use TLS encryption for network traffic
3. Bind to localhost if possible
4. Set appropriate firewall rules
5. Rotate passwords quarterly

### Defense in Depth
1. Implement IP-based rate limiting
2. Use CAPTCHA after 3 failed attempts
3. Log all lock/unlock events
4. Monitor for brute force patterns
5. Implement account recovery flows

## Monitoring Setup

### Key Metrics to Track
| Metric Name | Type | Description | Alert Threshold |
|------------|------|-------------|-----------------|
| auth_lock_attempts | Counter | Failed login attempts | >100/min |
| auth_lock_events | Counter | Account lock events | >10/min |
| auth_lock_duration | Histogram | Lock duration | >30min |
| redis_latency | Gauge | Redis response time | >500ms |

### Sample Grafana Dashboard
```json
{
  "panels": [
    {
      "title": "Failed Login Attempts",
      "type": "graph",
      "targets": [{
        "expr": "rate(auth_lock_attempts_total[5m])",
        "legendFormat": "{{email}}"
      }]
    },
    {
      "title": "Active Account Locks",
      "type": "stat",
      "targets": [{
        "expr": "count(auth_lock_events_total)",
        "legendFormat": "Locks"
      }]
    }
  ]
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Account Not Locking**
   - Verify Redis connection is working
   - Check `MAX_LOGIN_ATTEMPTS` value
   - Monitor `recordFailedAttempt()` calls

2. **Lock Not Clearing**
   - Check Redis TTL with `redis-cli ttl`
   - Verify `clearLock()` is called on success
   - Ensure Redis persistence is configured

3. **Performance Issues**
   - Check Redis memory usage
   - Monitor Redis CPU load
   - Verify connection pooling settings

4. **False Positives**
   - Review lock duration settings
   - Check for system clock drift
   - Verify application timezone

### Diagnostic Commands
```bash
# Check Redis memory usage
redis-cli info memory

# Monitor Redis operations
redis-cli monitor

# Check active locks
redis-cli keys "auth:lockout:*"

# Get lock details
redis-cli get "auth:lockout:user@example.com"
```

## Maintenance Procedures

### Quarterly Maintenance
1. Rotate Redis passwords
2. Review lock duration settings
3. Audit active locks
4. Review monitoring alerts
5. Test failover procedures

### Scaling Considerations
1. Redis cluster for high availability
2. Regional replication if needed
3. Load test with 2x expected traffic
4. Implement circuit breakers
5. Set up auto-scaling alerts
```