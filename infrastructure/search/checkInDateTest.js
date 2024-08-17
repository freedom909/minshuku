
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const cloudID=process.env.ES_CLOUD_ID;
const username=process.env.ES_USERNAME;
const password=process.env.ES_PASSWORD;
// const api_key=process.env.ES_API_KEY;

const client = new Client({
  node: [
         'https://0365222805934378a20e1e2d4cb145d2.us-central1.gcp.cloud.es.io:443',
 
         'https://minshuku-e64d78.es.us-west-2.aws.elastic.cloud:9243',
        ],

  
  auth: {
    username: username,
    password: password,
    // ES_API_KEY: api_key,
  },
  ssl: {
    rejectUnauthorized: true, // Ensures that SSL certificates are validated
  },
});

const checkIndexData = async (index) => {
    try {
      const response = await client.search({
        index: index,
        body: {
          query: {
            match_all: {} // Match all documents
          }
        }
      });
  
      console.log("All documents in the index:", response.hits.hits);
    } catch (error) {
      console.error('Failed to check index data:', error.message);
    }
  };
  
  // Usage
  checkIndexData('listings_index');
  