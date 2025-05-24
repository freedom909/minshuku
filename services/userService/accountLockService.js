import Redis from 'ioredis';

class AccountLockService {
        constructor({ redisClient, maxAttempts = 5, lockDuration = 15 * 60, namespace = 'auth:lockout:' }) {
            this.redis = redisClient;
            this.maxAttempts = maxAttempts;
            this.lockDuration = lockDuration;
            this.namespace = namespace;      
        // Bind methods
        this.getKey = this.getKey.bind(this);
        this.isAccountLocked = this.isAccountLocked.bind(this);
        this.recordFailedAttempt = this.recordFailedAttempt.bind(this);
        this.clearLock = this.clearLock.bind(this);
        this.getLockDetails = this.getLockDetails.bind(this);
    }

    // Generate Redis key for an email
    getKey(email) {
        return `${this.namespace}${email}`;
    }

    // Check if account is locked
    async isAccountLocked(email) {
        try {
            const key = this.getKey(email);
            const attempts = await this.redis.get(key);
            
            if (!attempts) return false;
            
            const numAttempts = parseInt(attempts, 10);
            if (numAttempts >= this.maxAttempts) {
                // Check if lock has expired
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
            return false; // Fail open to prevent lockouts due to Redis errors
        }
    }

    // Record a failed login attempt
    async recordFailedAttempt(email) {
        try {
            const key = this.getKey(email);
            const attempts = await this.redis.incr(key);
            
            // Set expiration on first attempt
            if (attempts === 1) {
                await this.redis.expire(key, this.lockDuration);
            }

            // Check if account should be locked
            if (attempts >= this.maxAttempts) {
                // Reset expiration to ensure full lock duration
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

    // Clear lock and reset attempts
    async clearLock(email) {
        try {
            await this.redis.del(this.getKey(email));
            return true;
        } catch (error) {
            console.error('Error clearing lock:', error);
            return false;
        }
    }

    // Get lock details including attempts and remaining time
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

    // Close Redis connection
    async close() {
        await this.redis.quit();
    }
}

export default AccountLockService;

// Usage example:
/*
const lockService = new AccountLockService({
    redisUrl: 'redis://localhost:6379',
    maxAttempts: 5,
    lockDuration: 900 // 15 minutes
});

// Check if account is locked
const isLocked = await lockService.isAccountLocked('user@example.com');

// Record failed attempt
const result = await lockService.recordFailedAttempt('user@example.com');

// Get lock details
const details = await lockService.getLockDetails('user@example.com');

// Clear lock
await lockService.clearLock('user@example.com');
*/