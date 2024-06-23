// import { initializeRepositories } from './datasources/initializeRepositories.js';
import  UserRepository  from '../../../infrastructure/repositories/userRepository.js';
import UserService from './userService.js';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv'
dotenv.config();



async function main() {
  const uri = process.env.MONGODB_URL;
  const dbName = process.env.DB_NAME;

  // Debugging statements to verify the environment variables
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
    const db = client.db(dbName); // Specify the database name here

    // Pass the db object to your UserRepository
    const userRepository = new UserRepository(db);
    console.log('UserRepository initialized successfully');
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
