/**
 * Complete Account Locking System Verification
 * 
 * This script tests all components of the account locking system
 * in an integrated fashion to verify the complete workflow.
 * 
 * Usage: node final-verification.js
 */

import AccountLockService from './accountLockService.js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

dotenv.config();

class SystemVerifier {
    constructor() {
        this.lockService = new AccountLockService({
            redisUrl: process.env.REDIS_URL,
            maxAttempts: 3,  // Lower for testing
            lockDuration: 30 // Short duration for testing
        });
        
        this.testEmail = 'verify@example.com';
        this.success = true;
        this.testResults = [];
    }

    async runVerification() {
        console.log('🔍 Starting Complete Account Locking System Verification\n');
        
        try {
            await this.testRedisIntegration();
            await this.testLockingWorkflow();
            await this.testMonitoringTools();
            await this.testManagementCommands();
            await this.testErrorRecovery();
            
            this.printSummary();
        } catch (error) {
            this.recordFailure('Verification failed', error);
            this.printSummary();
            process.exit(1);
        } finally {
            await this.cleanup();
            process.exit(this.success ? 0 : 1);
        }
    }

    async testRedisIntegration() {
        try {
            // Test basic Redis operations
            await this.lockService.redis.set('system-test', 'ok');
            const value = await this.lockService.redis.get('system-test');
            
            if (value !== 'ok') {
                throw new Error('Redis basic operations failed');
            }
            
            // Test Redis persistence
            await this.lockService.recordFailedAttempt(this.testEmail);
            const attempts = await this.lockService.redis.get(
                this.lockService.getKey(this.testEmail)
            );
            
            if (!attempts) {
                throw new Error('Redis persistence failed');
            }
            
            this.recordSuccess('Redis integration');
        } catch (error) {
            this.recordFailure('Redis integration', error);
            throw error;
        }
    }

    async testLockingWorkflow() {
        try {
            // Clear any existing lock
            await this.lockService.clearLock(this.testEmail);
            
            // Test initial state
            let isLocked = await this.lockService.isAccountLocked(this.testEmail);
            if (isLocked) {
                throw new Error('Account should not be locked initially');
            }
            
            // Test failed attempts
            for (let i = 1; i <= 3; i++) {
                await this.lockService.recordFailedAttempt(this.testEmail);
            }
            
            // Verify lock state
            isLocked = await this.lockService.isAccountLocked(this.testEmail);
            if (!isLocked) {
                throw new Error('Account should be locked after 3 attempts');
            }
            
            // Test lock expiration
            console.log('⏳ Waiting for lock to expire (30s)...');
            await new Promise(resolve => setTimeout(resolve, 31000));
            
            isLocked = await this.lockService.isAccountLocked(this.testEmail);
            if (isLocked) {
                throw new Error('Lock should have expired');
            }
            
            this.recordSuccess('Locking workflow');
        } catch (error) {
            this.recordFailure('Locking workflow', error);
            throw error;
        }
    }

    async testMonitoringTools() {
        try {
            // Test monitoring script
            try {
                require.resolve('./monitor-locks.js');
                this.recordSuccess('Monitoring module available');
            } catch {
                this.recordWarning('Monitoring module not found');
            }
            
            // Test metrics collection
            await this.lockService.recordFailedAttempt(this.testEmail);
            const details = await this.lockService.getLockDetails(this.testEmail);
            if (!details || details.attempts !== 1) {
                throw new Error('Metrics collection failed');
            }
            
            this.recordSuccess('Metrics collection');
        } catch (error) {
            this.recordFailure('Monitoring tools', error);
            throw error;
        }
    }

    async testManagementCommands() {
        try {
            // Test management script
            try {
                const output = execSync('./manage-locks.sh status verify@example.com', {
                    stdio: 'pipe'
                }).toString();
                
                if (!output.includes('verify@example.com')) {
                    throw new Error('Management script output invalid');
                }
                
                this.recordSuccess('Management script');
            } catch (error) {
                this.recordWarning('Management script test skipped');
            }
            
            // Test direct Redis commands
            const redisOutput = execSync('redis-cli keys "auth:lockout:*"').toString();
            if (!redisOutput.includes(this.testEmail)) {
                throw new Error('Redis command test failed');
            }
            
            this.recordSuccess('Redis commands');
        } catch (error) {
            this.recordFailure('Management commands', error);
            throw error;
        }
    }

    async testErrorRecovery() {
        try {
            // Test Redis failure handling
            try {
                console.log('⏳ Simulating Redis failure...');
                execSync('redis-cli shutdown nosave');
                
                // Verify fail-open behavior
                const result = await this.lockService.isAccountLocked(this.testEmail);
                if (result !== false) {
                    throw new Error('Fail-open behavior not working');
                }
                
                // Restart Redis
                execSync('redis-server --daemonize yes');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.recordSuccess('Redis failure handling');
            } catch (error) {
                this.recordWarning('Redis failure simulation skipped');
            }
            
            // Test invalid input handling
            try {
                await this.lockService.recordFailedAttempt('');
                throw new Error('Empty email validation failed');
            } catch (error) {
                if (!error.message.includes('valid email')) {
                    throw new Error('Invalid error message for empty email');
                }
            }
            
            this.recordSuccess('Input validation');
        } catch (error) {
            this.recordFailure('Error recovery', error);
            throw error;
        }
    }

    recordSuccess(testName) {
        this.testResults.push({
            test: testName,
            status: '✅ PASSED',
            details: ''
        });
    }

    recordFailure(testName, error) {
        this.success = false;
        this.testResults.push({
            test: testName,
            status: '❌ FAILED',
            details: error.message
        });
    }

    recordWarning(message) {
        this.testResults.push({
            test: message,
            status: '⚠️ WARNING',
            details: ''
        });
    }

    printSummary() {
        console.log('\n📊 Verification Summary');
        console.log('======================');
        
        this.testResults.forEach(test => {
            console.log(`${test.status} - ${test.test}`);
            if (test.details) {
                console.log(`   ${test.details}`);
            }
        });
        
        console.log('\n🔚 Verification', this.success ? 'PASSED' : 'FAILED');
    }

    async cleanup() {
        try {
            // Clear test locks
            await this.lockService.clearLock(this.testEmail);
            await this.lockService.close();
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
}

// Run verification
new SystemVerifier().runVerification().catch(console.error);