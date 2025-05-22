/**
 * AccountLockService Usage Examples and Test Cases
 * 
 * This file demonstrates common usage patterns and edge cases
 * for the AccountLockService.
 * 
 * Run with: node accountLockService.examples.js
 */

import AccountLockService from './accountLockService.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for formatting time
const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    return `${Math.floor(seconds / 60)} minutes`;
};

async function runExamples() {
    console.log('🚀 Starting AccountLockService Examples\n');

    // Initialize service with custom settings
    const lockService = new AccountLockService({
        redisUrl: process.env.REDIS_URL,
        maxAttempts: 3,  // Lower for testing
        lockDuration: 60 // 1 minute for testing
    });

    try {
        // Example 1: Basic Usage
        console.log('📝 Example 1: Basic Usage');
        const email = 'test@example.com';
        
        // Clear any existing lock
        await lockService.clearLock(email);
        console.log('- Initial state cleared');
        
        // Check initial state
        let isLocked = await lockService.isAccountLocked(email);
        console.log('- Account locked initially:', isLocked);
        
        // Record some failed attempts
        for (let i = 1; i <= 2; i++) {
            const result = await lockService.recordFailedAttempt(email);
            console.log(`- Failed attempt ${i}:`, result);
        }
        
        // Check lock details
        let details = await lockService.getLockDetails(email);
        console.log('- Lock details:', details);
        
        console.log('\n');

        // Example 2: Account Locking
        console.log('📝 Example 2: Account Locking');
        
        // Record final attempt that should lock the account
        const lockResult = await lockService.recordFailedAttempt(email);
        console.log('- Final attempt result:', lockResult);
        
        // Verify account is locked
        isLocked = await lockService.isAccountLocked(email);
        console.log('- Account locked:', isLocked);
        
        // Get updated details
        details = await lockService.getLockDetails(email);
        console.log('- Updated lock details:', details);
        
        console.log('\n');

        // Example 3: Lock Duration
        console.log('📝 Example 3: Lock Duration');
        console.log('- Waiting 5 seconds...');
        await wait(5000);
        
        details = await lockService.getLockDetails(email);
        console.log('- Remaining lock time:', formatTime(details.remainingTime));
        
        console.log('\n');

        // Example 4: Clear Lock
        console.log('📝 Example 4: Clear Lock');
        
        // Clear the lock
        await lockService.clearLock(email);
        console.log('- Lock cleared');
        
        // Verify account is unlocked
        isLocked = await lockService.isAccountLocked(email);
        console.log('- Account locked after clear:', isLocked);
        
        console.log('\n');

        // Example 5: Edge Cases
        console.log('📝 Example 5: Edge Cases');
        
        // Try with invalid email
        try {
            await lockService.recordFailedAttempt('');
        } catch (error) {
            console.log('- Invalid email handled:', error.message);
        }
        
        // Try with null email
        try {
            await lockService.recordFailedAttempt(null);
        } catch (error) {
            console.log('- Null email handled:', error.message);
        }
        
        console.log('\n');

        // Example 6: Multiple Accounts
        console.log('📝 Example 6: Multiple Accounts');
        const emails = [
            'user1@example.com',
            'user2@example.com',
            'user3@example.com'
        ];
        
        // Record failed attempts for multiple accounts
        for (const testEmail of emails) {
            const result = await lockService.recordFailedAttempt(testEmail);
            console.log(`- Failed attempt for ${testEmail}:`, result);
        }
        
        // Check status of all accounts
        for (const testEmail of emails) {
            const details = await lockService.getLockDetails(testEmail);
            console.log(`- Status for ${testEmail}:`, details);
        }

    } catch (error) {
        console.error('❌ Error during examples:', error);
    } finally {
        // Clean up
        await lockService.close();
        console.log('\n✅ Examples completed');
    }
}

// Run the examples
runExamples().catch(console.error);