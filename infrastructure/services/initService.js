import UserRepository from '../repositories/userRepository.js';
import UserService from './userService.js';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// export async function initializeServices() {
//   const uri = process.env.MONGODB_URI;
//   const dbName = process.env.DB_NAME;

//   if (!uri) {
//     console.error('MONGODB_URI is not defined');
//     return;
//   }
//   if (!dbName) {
//     console.error('DB_NAME is not defined');
//     return;
//   }

//   console.log('MongoDB URI:', uri);
//   console.log('Database Name:', dbName);

//   const client = new MongoClient(uri);

//   try {
//     await client.connect();
//     const db = client.db(dbName);

//     // Log to verify db object structure
//     console.log('Database object:', db);

//     // Pass the db object to your UserRepository
//     const userRepository = new UserRepository(db);
//     console.log('UserRepository initialized successfully');
//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }

// initializeServices().catch(console.error);
// export default initializeServices;

// async function initializeServices(db) {
//   const userRepository = new UserRepository(db); // Assuming UserRepository is a class that interacts with the database
//   const userService = new UserService(userRepository);
//   return { userService };
// }
// export default initializeServices;
// infrastructure/services/initializeService.js

// import UserRepository from '../repositories/userRepository.js';
// import UserService from './userService.js';
// import { MongoClient } from 'mongodb';
// import dotenv from 'dotenv';

// dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let client;
async function initializeServices() {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('MongoDB connected');

    const db = client.db(dbName);
    console.log('DB object:', db);

    if (!db) {
      throw new Error('Failed to connect to the database');
    }

    const userRepository = new UserRepository(db);
    const userService = new UserService(userRepository);

    return { userService };
  } catch (error) {
    console.error('Error initializing services:', error);
    throw new Error('Failed to initialize services');
  }
}
export default initializeServices;
