/**
 * AccountLockService Performance Test
 * 
 * This script tests the performance of the AccountLockService under load.
 * 
 * Usage: node performanceTest.js [numUsers] [attemptsPerUser]
 * Example: node performanceTest.js 1000 5
 */

import AccountLockService from './accountLockService.js';
import dotenv from 'dotenv';
import { performance } from 'perf_hooks';

dotenv.config();

async function runPerformanceTest(numUsers = 1000, attemptsPerUser = 5) {
    console.log(`🚀 Starting performance test with ${numUsers} users and ${attemptsPerUser} attempts each\n`);
    
    const lockService = new AccountLockService({
        redisUrl: process.env.REDIS_URL,
        maxAttempts: 5,
        lockDuration: 60
    });

    try {
        // Generate test emails
        const testEmails = Array.from({ length: numUsers }, (_, i) => `user${i}@example.com`);

        // Clear all locks before starting
        console.log('🧹 Clearing existing locks...');
        await Promise.all(testEmails.map(email => lockService.clearLock(email)));
        
        // Test parameters
        const totalAttempts = numUsers * attemptsPerUser;
        console.log(`🔢 Total attempts to simulate: ${totalAttempts}`);
        
        // Start timer
        const startTime = performance.now();
        let completed = 0;
        let errors = 0;
        let locksTriggered = 0;

        // Progress tracker
        const progressInterval = setInterval(() => {
            const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
            console.log(`⏱️ Progress: ${completed}/${totalAttempts} attempts (${errors} errors) in ${elapsed}s`);
        }, 1000);

        // Run concurrent tests
        const results = await Promise.allSettled(
            testEmails.map(email => 
                (async () => {
                    for (let i = 0; i < attemptsPerUser; i++) {
                        try {
                            const result = await lockService.recordFailedAttempt(email);
                            if (result.locked) locksTriggered++;
                            completed++;
                        } catch (error) {
                            errors++;
                        }
                    }
                })()
            )
        );

        // Stop timer and progress tracker
        clearInterval(progressInterval);
        const endTime = performance.now();
        const totalTime = (endTime - startTime) / 1000;

        // Calculate metrics
        const attemptsPerSecond = (completed / totalTime).toFixed(2);
        const errorRate = ((errors / totalAttempts) * 100).toFixed(2);

        // Print summary
        console.log('\n📊 Performance Test Results');
        console.log('==========================');
        console.log(`👥 Users: ${numUsers}`);
        console.log(`🔢 Attempts per user: ${attemptsPerUser}`);
        console.log(`✅ Successful attempts: ${completed}`);
        console.log(`❌ Errors: ${errors} (${errorRate}%)`);
        console.log(`🔒 Locks triggered: ${locksTriggered}`);
        console.log(`⏱️ Total time: ${totalTime.toFixed(2)} seconds`);
        console.log(`⚡ Throughput: ${attemptsPerSecond} attempts/second`);
        console.log('==========================\n');

        // Check Redis stats
        console.log('🔍 Checking Redis stats...');
        const memoryUsage = await lockService.redis.info('memory');
        const stats = await lockService.redis.info('stats');
        
        console.log('\n🧠 Redis Memory Usage:');
        console.log(memoryUsage.split('\n').filter(line => line.includes('used_memory')));
        
        console.log('\n📈 Redis Stats:');
        console.log(stats.split('\n').filter(line => 
            line.includes('total_commands_processed') || 
            line.includes('instantaneous_ops_per_sec')
        ));

    } catch (error) {
        console.error('❌ Error during performance test:', error);
    } finally {
        await lockService.close();
        console.log('\n🏁 Performance test completed');
    }
}

// Parse command line arguments
const numUsers = parseInt(process.argv[2] || '1000', 10);
const attemptsPerUser = parseInt(process.argv[3] || '5', 10);

// Run the test
runPerformanceTest(numUsers, attemptsPerUser).catch(console.error);