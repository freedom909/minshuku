import { MongoClient } from 'mongodb';
import 'dotenv/config';

(async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB!');
    const db = client.db();
    console.log('Collections:', await db.listCollections().toArray());
    await client.close();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
  }
})();
