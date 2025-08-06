import cron from 'node-cron';
import { EventEmitter } from 'events';

// Create an event emitter for reindexing events
const reindexingEmitter = new EventEmitter();

export { reindexingEmitter };
import { getSearchIndex } from './searchIndex.js';
import { getSearchIndexName } from './searchIndex.js';
import { getSearchIndexType } from './searchIndex.js';



// Schedule the data sync to run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    await syncAllData();
  } catch (error) {
    console.error('Error during scheduled sync:', error);
  }
});

// Function to sync all data (MySQL listings and MongoDB users)
async function syncAllData() {
  try {
    console.log('Running full data sync job');
    // Add code here to call MySQL and MongoDB sync functions
    // For example:
    // await syncMySQLListings();
    // await syncMongoDBUsers();
    console.log('Full data sync completed');
  } catch (error) {
    console.error('Error during full data sync:', error);
  }
}

// Event listener for reindexing events
reindexingEmitter.on('reindex', async () => {
  try {
    console.log('Triggering immediate reindexing');
    await syncAllData();
    console.log('Immediate reindexing completed');
  } catch (error) {
    console.error('Error during immediate reindexing:', error);
  }
});
  try {
    console.log('Running data sync job');
    // Fetch and index data as before...

    const mysqlPool = await dbConfig.mysql();
    const searchIndex = await getSearchIndex(mysqlPool);
    const searchIndexName = await getSearchIndexName(mysqlPool);
    const searchIndexType = await getSearchIndexType(mysqlPool);
   
    
    // Fetch and index data as before...
    
    const mongoDb = await dbConfig.mongo();
    const collection = await mongoDb.collection('users');
    const users = await collection.find().toArray();
    const userDocuments = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      nickname: user.nickname,
      picture: user.picture,
      roles: user.roles,
      createdAt: user.createdAt

    }))
  
    // Fetch and index data as before...
  
    console.log('Data sync completed');

  }catch (error) {
    console.error('Error syncing data:', error);
  }
