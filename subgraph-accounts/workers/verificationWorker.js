import { Worker } from 'bullmq';
import { VERIFICATION_QUEUE_NAME } from '../mq/verificationQueue.js'; // Corrected path
import initAccountContainer from '../../services/DB/initAccountContainer.js'; // This path seems correct

async function main() {
  // Initialize services using your dependency injection container
  const container = await initAccountContainer();
  const myNumberCardService = container.resolve('myNumberCardService');

  const worker = new Worker(VERIFICATION_QUEUE_NAME, async (job) => {
    if (job.name === 'verify-mynumber') {
      console.log(`Processing verification job for user ${job.data.userId}`);
      try {
        const result = await myNumberCardService.verifyMyNumberCard(job.data);
        console.log(`Verification for user ${job.data.userId} completed. Success: ${result.success}`);
        // TODO: Add notification logic here (e.g., email, push notification)
      } catch (error) {
        console.error(`Verification job for user ${job.data.userId} failed:`, error);
      }
    }
  }, {
    connection: { host: process.env.REDIS_HOST || 'localhost', port: process.env.REDIS_PORT || 6379 },
  });

  console.log('✅ Verification worker started and listening for jobs...');
}

main().catch(err => {
  console.error("❌ Failed to start verification worker:", err);
  process.exit(1);
});