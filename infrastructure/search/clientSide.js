import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

const cloudID=process.env.ES_CLOUD_ID;
const username=process.env.ES_USERNAME;
const password=process.env.ES_PASSWORD;
// const api_key=process.env.ES_API_KEY;

const client = new Client({
  node: [
  //  'https://e64d78593e59431a835c40042381edbb.us-central1.gcp.cloud.es.io:443',

    'https://60a172ce59124d5bbff7fc0fa93326bd.us-central1.gcp.cloud.es.io:9243',
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