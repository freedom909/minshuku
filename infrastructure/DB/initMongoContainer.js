// infrastructure/DB/initMongoContainer.js
import pkg from 'mongodb';
const { MongoClient } = pkg;
import { createContainer, asClass, asValue } from 'awilix';
import dotenv from 'dotenv';
import UserRepository from '../repositories/userRepository.js';
import UserService from '../services/userService.js';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

export async function connectMongoDB() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  return db;
}

const initMongoContainer = async () => {
  const mongoDB = await connectMongoDB();

  const container = createContainer();
  container.register({
    mongoDB: asValue(mongoDB),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton()
  });

  console.log('MongoDB Database connected');
  return container;
};

export default initMongoContainer;
