import client from './clientSide.js';

const testConnection = async () => {
  try {
    const response = await client.info();
    console.log('Elasticsearch connection successful:', response);
  } catch (error) {
    console.error('Failed to connect to Elasticsearch:', error);
  }
};

testConnection();
