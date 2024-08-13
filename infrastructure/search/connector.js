import { createConnection } from 'mysql2/promise';
import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// Create MySQL connection
const mysqlConnection = await createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// Create Elasticsearch client
const esClient = new Client({
  node: process.env.ES_ENDPOINT, // e.g., 'https://username:password@your-es-host:9200'
  auth: {
    username: process.env.ES_USERNAME,
    password: process.env.ES_PASSWORD,
  },
});

async function syncDataToElasticsearch() {
  try {
    // Fetch data from MySQL
    const [rows] = await mysqlConnection.query('SELECT * FROM listings');

    // Index each row in Elasticsearch
    for (let row of rows) {
        for (let row of rows) {
            // Transform the row data if necessary
            const transformedRow = {
              costPerNight: row.costPerNight,
              title: row.title,
              locationType: row.locationType,
              description: row.description,
              id: row.id, // Unique identifier for Elasticsearch
              numOfBeds: row.numOfBeds,
              photoThumbnail: row.photoThumbnail,
              hostId: row.hostId,
              isFeatured: row.isFeatured,
              saleAmount: row.saleAmount,
              bookingNumber: row.bookingNumber,
              checkInDate: new Date(row.checkInDate).toISOString(), // Convert date to ISO string
              checkOutDate: new Date(row.checkOutDate).toISOString(), // Convert date to ISO string
              listingStatus: row.listingStatus
            };
          
            // Index the transformed row in Elasticsearch
            await esClient.index({
              index: 'listings_index',
              id: transformedRow.id, // Use the unique identifier from the data
              body: transformedRow,  // The data to index
            });
          }
          
    }

    console.log('Data synced to Elasticsearch successfully!');
  } catch (error) {
    console.error('Error syncing data to Elasticsearch:', error);
  }
}

// Run the sync function
syncDataToElasticsearch();
