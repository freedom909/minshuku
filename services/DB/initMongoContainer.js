// services/DB/initMongoContainer.js
import pkg from 'mongodb';
const { MongoClient } = pkg;
import { createContainer, asClass, asValue } from 'awilix';
import connectToMongoDB from './connectMongoDB.js';

const initMongoContainer = async () => {
  try {
    const mongodb = await connectToMongoDB();
    console.log('MongoDB Database connected');
    return mongodb; // ✅ return the actual DB instance
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

export default initMongoContainer;

