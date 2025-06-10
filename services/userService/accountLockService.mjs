import { createClient } from 'redis';
const Redis = createClient();
import { promisify } from 'util';

class AccountLockService {
    constructor({ redisClient, maxAttempts = 5,lockDuration = 15 * 60, namespace = 'auth:lockout:' }) {
        if (!redisClient || typeof redisClient.get !== 'function') {
            throw new Error('Invalid Redis client provided to AccountLockService');
        }
        this.redis = redisClient;
        this.maxAttempts = maxAttempts;
        this.lockDuration = lockDuration;
        this.namespace = namespace;
        this.getKey = this.getKey.bind(this);
        this.isAccountLocked = this.isAccountLocked.bind(this);
        this.recordFailedAttempt = this.recordFailedAttempt.bind(this);
        this.clearLock = this.clearLock.bind(this);
        this.getLockDetails = this.getLockDetails.bind(this);
    }
    getKey(email) {
        return `${this.namespace}${email}`;
    }
    async lockAccount(userId) {
        await this.redis.set(`lock:${userId}`, 'true', { EX: 3600 });
    }
    async recordAttempt(userId) {
        const key = `attempts:${userId}`;
        const attempts = await this.redis.incr(key);
        if (attempts === 1) {
            await this.redis.expire(key, 3600);
        }
        return attempts;
    }
    async isAccountLocked(email) {
        try {
            const key = this.getKey(email);
            const attempts = await this.redis.get(key);
            if (!attempts) return false;
            const numAttempts = parseInt(attempts, 10);
            if (numAttempts >= this.maxAttempts) {
                const ttl = await this.redis.ttl(key);
                if (ttl <= 0) {
                    await this.clearLock(email);
                    return false;
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking account lock:', error);
            return false;
        }
    }
    async recordFailedAttempt(email) {
        try {
            const key = this.getKey(email);
            const attempts = await this.redis.incr(key);
            if (attempts === 1) {
                await this.redis.expire(key, this.lockDuration);
            }
            if (attempts >= this.maxAttempts) {
                await this.redis.expire(key, this.lockDuration);
                return {
                    locked: true,
                    attempts,
                    remainingTime: this.lockDuration
                };
            }
            return {
                locked: false,
                attempts,
                remainingAttempts: this.maxAttempts - attempts
            };
        } catch (error) {
            console.error('Error recording failed attempt:', error);
            return {
                locked: false,
                attempts: 0,
                error: error.message
            };
        }
    }
    async clearAttempts(email) {
        try {
            await this.redis.del(this.getKey(email));
            return true;
        } catch (error) {
            console.error('Error clearing attempts:', error);
            return false;
        }
    }
    async clearLock(email) {
        try {
            await this.redis.del(this.getKey(email));
            return true;
        } catch (error) {
            console.error('Error clearing lock:', error);
            return false;
        }
    }
    async getLockDetails(email) {
        try {
            const key = this.getKey(email);
            const attempts = await this.redis.get(key);
            if (!attempts) {
                return {
                    isLocked: false,
                    attempts: 0,
                    remainingTime: 0
                };
            }
            const numAttempts = parseInt(attempts, 10);
            const ttl = await this.redis.ttl(key);
            return {
                isLocked: numAttempts >= this.maxAttempts,
                attempts: numAttempts,
                remainingTime: ttl > 0 ? ttl : 0,
                remainingAttempts: Math.max(0, this.maxAttempts - numAttempts)
            };
        } catch (error) {
            console.error('Error getting lock details:', error);
            return {
                isLocked: false,
                attempts: 0,
                remainingTime: 0,
                error: error.message
            };
        }
    }
    async close() {
        await this.redis.quit();
    }
}

export default AccountLockService;