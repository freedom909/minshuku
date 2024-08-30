import crom from 'node-cron';
import { getSearchIndex } from './searchIndex.js';
import { getSearchIndexName } from './searchIndex.js';
import { getSearchIndexType } from './searchIndex.js';



// Schedule the data sync to run every day at midnight
crom.schedule('0 0 * * *', async () => {
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
})