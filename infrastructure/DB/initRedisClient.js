// infrastructure/DB/initRedisClient.js
import {createClient} from 'redis';


const initRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await client.connect();

  return client;
};

export default initRedisClient;
