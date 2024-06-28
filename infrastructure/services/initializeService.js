import UserRepository from '../repositories/userRepository.js';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export async function initializeServices() {
  const uri = process.env.MONGODB_URL;
  const dbName = process.env.DB_NAME;

  if (!uri) {
    console.error('MONGODB_URL is not defined');
    return;
  }
  if (!dbName) {
    console.error('DB_NAME is not defined');
    return;
  }

  console.log('MongoDB URI:', uri);
  console.log('Database Name:', dbName);

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    // Log to verify db object structure
    console.log('Database object:', db);

    // Pass the db object to your UserRepository
    const userRepository = new UserRepository(db);
    console.log('UserRepository initialized successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

initializeServices().catch(console.error);

