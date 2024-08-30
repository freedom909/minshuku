import { createConnection } from 'mysql2/promise';
import { Client } from '@elastic/elasticsearch';

// Create MySQL connection
 const mysqlConnection = await createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'princess',
  database: 'air'
});

// Create Elasticsearch client
 const esClient = new Client({
  node: 'https://fdb1fb542dd84eba8ec8d0431e1862d8.us-central1.gcp.cloud.es.io:9243',
  auth: {
    username: 'elastic',
    password: '1HPuNglgn6BxJ6p0QbqI2suP',
  },
});


async function syncDataToElasticsearch() {
  try {
    // Fetch data from MySQL
    const [rows] = await mysqlConnection.query('SELECT * FROM listings');

    // Index each row in Elasticsearch
    for (let row of rows) {
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
      await esClient.index({
        index: 'listings_index',
        id:  transformedRow.id, // Use a unique identifier from your data
        body: transformedRow,  // You might want to transform this if needed
      });
    }

    console.log('Data synced to Elasticsearch successfully!');
  } catch (error) {
    console.error('Error syncing data to Elasticsearch:', error);
  }
}

// Run the sync function
syncDataToElasticsearch();
export { mysqlConnection , esClient}
