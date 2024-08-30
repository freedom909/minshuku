import {esClient} from './syncData.js'
async function testConnection() {
    try {
      const response = await esClient.ping();
      console.log('Elasticsearch connection successful:', response);
    } catch (error) {
      console.error('Elasticsearch connection failed:', error);
    }
  }
  
  testConnection();
  