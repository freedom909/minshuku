import { createClient } from 'redis';

const redisClient = createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

redisClient.connect();

export default redisClient;
