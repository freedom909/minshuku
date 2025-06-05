import { createClient } from 'redis';

const initRedisClient = async () => {
  const client = createClient();
  await client.connect(); // Very important for redis v4+
  return client;
};

export default initRedisClient;
