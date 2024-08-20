import { Client } from '@elastic/elasticsearch';
import axios from 'axios';

const createIndexIfNotExists = async (client, index, mappings) => {
  const indexExists = await client.indices.exists({ index });
  if (!indexExists.body) {
    await client.indices.create({
      index,
      body: mappings,
    });
    console.log(`Index ${index} created.`);
  } else {
    console.log(`Index ${index} already exists.`);
  }
};

const indexDocuments = async (client, index, documents) => {
  for (const doc of documents) {
    await client.index({
      index,
      id: doc.id, // Ensure a unique ID
      body: doc,
    });
  }
  console.log(`Data indexed successfully to ${index}`);
};

const indexData = async () => {
  const client = new Client({ node: 'http://localhost:9200' });

  try {
    await createIndexIfNotExists(client, 'listings', {
      settings: {
        analysis: {
          analyzer: {
            description_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'stop'],
            },
          },
        },
      },
      mappings: {
        properties: {
          name: { type: 'text' },
          description: { type: 'text', analyzer: 'description_analyzer' },
          price: { type: 'float' },
          location: { type: 'geo_point' },
          checkInDate: { type: 'date' },
          checkOutDate: { type: 'date' },
          numOfBeds: { type: 'integer' },
        },
      },
    });

    const listingsData = await axios.get(process.env.MYSQL_API_URL, {
      headers: { 'Authorization': `Bearer ${process.env.MYSQL_API_KEY}` },
    });
    await indexDocuments(client, 'listings', listingsData.data);

    await createIndexIfNotExists(client, 'users', {
      mappings: {
        properties: {
          name: { type: 'text' },
          email: { type: 'text' },
          nickname: { type: 'text' },
          description:{type:'text'},
          role:{type:'keyword'}
        },
      },
    });

  
    const usersData = await axios.get(process.env.MONGO_API_URL, {
      headers: { 'Authorization': `Bearer ${process.env.MONGO_API_KEY}` },
    });
    for (const user of usersData.data) {
      await client.index({
        index: 'users',
        id: user.id, 
        body: {
          ...user,
          role: user.role // Assuming the role is part of the user data
        }
      });
    }
    console.log(`Data indexed successfully to users`);
    await indexDocuments(client, 'users', usersData.data);

  } catch (error) {
    console.error('Error indexing data:', error.message);
  }
};

export default indexData;
