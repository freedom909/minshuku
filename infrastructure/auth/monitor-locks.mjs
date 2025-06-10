/**
 * Account Lock Monitoring Script
 * 
 * This script monitors account locking activity in real-time
 * and provides statistics about login attempts and locks.
 * 
 * Usage: node monitor-locks.js
 */

import AccountLockService from './accountLockService.mjs';
import dotenv from 'dotenv';

dotenv.config();

class LockMonitor {
    constructor() {
        this.lockService = new AccountLockService({
            redisUrl: process.env.REDIS_URL,
            maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
            lockDuration: parseInt(process.env.ACCOUNT_LOCK_DURATION || '900', 10)
        });

        this.stats = {
            totalAttempts: 0,
            lockedAccounts: 0,
            activeMonitoring: false,
            startTime: null,
            lockedEmails: new Set()
        };
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    async displayStats() {
        console.clear();
        const now = new Date();
        const runningTime = now - this.stats.startTime;

        console.log('\n📊 Account Lock Monitor');
        console.log('=====================================');
        console.log(`🕒 Running time: ${this.formatDuration(runningTime)}`);
        console.log(`📝 Total login attempts: ${this.stats.totalAttempts}`);
        console.log(`🔒 Currently locked accounts: ${this.stats.lockedAccounts}`);
        console.log('=====================================\n');

        if (this.stats.lockedEmails.size > 0) {
            console.log('🔐 Locked Accounts:');
            for (const email of this.stats.lockedEmails) {
                const details = await this.lockService.getLockDetails(email);
                console.log(`- ${email}`);
                console.log(`  Remaining time: ${this.formatDuration(details.remainingTime * 1000)}`);
                console.log(`  Failed attempts: ${details.attempts}`);
            }
            console.log('');
        }

        console.log('Press Ctrl+C to stop monitoring\n');
    }

    async startMonitoring() {
        this.stats.activeMonitoring = true;
        this.stats.startTime = new Date();

        console.log('🚀 Starting account lock monitoring...\n');

        // Update stats every 5 seconds
        const updateInterval = setInterval(async () => {
            if (!this.stats.activeMonitoring) {
                clearInterval(updateInterval);
                return;
            }

            try {
                // Get all keys from Redis matching our lock pattern
                const keys = await this.lockService.redis.keys(`${this.lockService.namespace}*`);
                
                // Update locked accounts count
                this.stats.lockedAccounts = 0;
                this.stats.lockedEmails.clear();

                // Check each key
                for (const key of keys) {
                    const email = key.replace(this.lockService.namespace, '');
                    const isLocked = await this.lockService.isAccountLocked(email);
                    
                    if (isLocked) {
                        this.stats.lockedAccounts++;
                        this.stats.lockedEmails.add(email);
                    }
                }

                await this.displayStats();
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }, 5000);

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\nStopping monitor...');
            this.stats.activeMonitoring = false;
            await this.lockService.close();
            console.log('Monitor stopped. Final stats:');
            await this.displayStats();
            process.exit(0);
        });
    }

    // Method to simulate some login attempts (for testing)
    async simulateActivity() {
        const testEmails = [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com'
        ];

        setInterval(async () => {
            if (!this.stats.activeMonitoring) return;

            const email = testEmails[Math.floor(Math.random() * testEmails.length)];
            this.stats.totalAttempts++;

            try {
                await this.lockService.recordFailedAttempt(email);
            } catch (error) {
                console.error('Error simulating activity:', error);
            }
        }, 2000); // Simulate an attempt every 2 seconds
    }
}

// Start monitoring
const monitor = new LockMonitor();
monitor.startMonitoring();

// Uncomment to simulate activity (for testing)
// monitor.simulateActivity();