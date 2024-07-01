import UserRepository from '../repositories/userRepository.js';
import UserService from './userService.js';
import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
let client;

async function initializeServices() {
  try {
    client = new MongoClient(uri);
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