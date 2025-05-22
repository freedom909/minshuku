/**
 * Test script for AccountLockService
 * 
 * This script demonstrates the account locking functionality
 * by simulating multiple failed login attempts.
 * 
 * Usage:
 * node test-account-lock.js <email> <attempts>
 * 
 * Example:
 * node test-account-lock.js test@example.com 6
 */

import dotenv from 'dotenv';
import AccountLockService from './accountLockService.js';

// Load environment variables
dotenv.config();

// Parse command line arguments
const email = process.argv[2] || 'test@example.com';
const attempts = parseInt(process.argv[3] || '6', 10);

// Create account lock service
const lockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockDuration: parseInt(process.env.ACCOUNT_LOCK_DURATION || '900', 10)
});

// Helper to format time
function formatSeconds(seconds) {
  if (seconds < 60) return `${seconds} seconds`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} minutes, ${remainingSeconds} seconds`;
}

// Test account locking
async function testAccountLocking() {
  try {
    console.log(`\n🔒 Testing account locking for ${email}`);
    console.log(`🔢 Will simulate ${attempts} failed login attempts`);
    console.log(`⚙️ Max attempts before lock: ${lockService.maxAttempts}`);
    console.log(`⏱️ Lock duration: ${formatSeconds(lockService.lockDuration)}\n`);

    // Clear any existing lock
    await lockService.clearLock(email);
    console.log('✅ Cleared any existing lock');

    // Check initial state
    const initialState = await lockService.getLockDetails(email);
    console.log('📊 Initial state:', initialState);

    // Simulate failed login attempts
    console.log('\n🔄 Simulating failed login attempts...');
    for (let i = 1; i <= attempts; i++) {
      const result = await lockService.recordFailedAttempt(email);
      console.log(`Attempt ${i}:`, result);
      
      // Check if account is locked
      const isLocked = await lockService.isAccountLocked(email);
      if (isLocked) {
        console.log(`🔴 Account locked after ${i} attempts`);
      }
    }

    // Get final lock details
    const finalState = await lockService.getLockDetails(email);
    console.log('\n📊 Final state:', finalState);

    // Check if account is locked
    const isLocked = await lockService.isAccountLocked(email);
    console.log(`🔒 Account locked: ${isLocked}`);

    if (isLocked) {
      console.log(`⏱️ Remaining lock time: ${formatSeconds(finalState.remainingTime)}`);
    }

    // Test clearing the lock
    console.log('\n🔄 Testing lock clearing...');
    await lockService.clearLock(email);
    const afterClear = await lockService.getLockDetails(email);
    console.log('📊 After clearing lock:', afterClear);
    console.log(`🔒 Account locked after clearing: ${await lockService.isAccountLocked(email)}`);

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    // Close Redis connection
    await lockService.close();
    console.log('\n👋 Test completed');
  }
}

// Run the test
testAccountLocking();