import { GraphQLError } from 'graphql';
import Redis from 'ioredis';

class AccountLockService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.MAX_ATTEMPTS = 5;
    this.LOCK_TIME_MINUTES = 15;
  }

  async recordAttempt(email) {
    const key = `lockout:${email}`;
    const attempts = await this.redis.incr(key);
    
    // Set expiration if this is the first attempt
    if (attempts === 1) {
      await this.redis.expire(key, this.LOCK_TIME_MINUTES * 60);
    }

    return attempts;
  }

  async isAccountLocked(email) {
    const attempts = await this.getAttemptCount(email);
    return attempts >= this.MAX_ATTEMPTS;
  }

  async getAttemptCount(email) {
    const key = `lockout:${email}`;
    const attempts = await this.redis.get(key);
    return parseInt(attempts || 0, 10);
  }

  async getLockTimeRemaining(email) {
    const key = `lockout:${email}`;
    const ttl = await this.redis.ttl(key);
    return Math.max(0, Math.ceil(ttl / 60)); // Return in minutes
  }

  async clearAttempts(email) {
    const key = `lockout:${email}`;
    await this.redis.del(key);
  }

  async handleFailedLogin(email) {
    const attempts = await this.recordAttempt(email);
    if (attempts >= this.MAX_ATTEMPTS) {
      throw new GraphQLError('Too many failed attempts. Account temporarily locked.', {
        extensions: {
          code: 'ACCOUNT_LOCKED',
          retryAfter: await this.getLockTimeRemaining(email)
        }
      });
    }
  }
}

export default AccountLockService;