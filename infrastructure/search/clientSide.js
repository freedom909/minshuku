import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const cloudID=process.env.ES_CLOUD_ID;
const username=process.env.ES_USERNAME;
const password=process.env.ES_PASSWORD;
// const api_key=process.env.ES_API_KEY;

const client = new Client({
  node: [
    'https://0365222805934378a20e1e2d4cb145d2.us-central1.gcp.cloud.es.io',
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
console.log('Cloud ID:', cloudID),
client.ping()
  .then(response => console.log("You are connected to Elasticsearch!"))
  .catch(error => console.error("Elasticsearch is not connected."))
client.info().then(console.log)
export default client