import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const uri=process.env.MONGODB_URI; ;
const dbName=process.env.DB_NAME;

let  mongoDB;

export async function connectMongoDB() {
  if (!mongoDB) {
    const client = new MongoClient(uri);
    await client.connect();
    mongoDB = client.db(dbName);
  }
  return mongoDB;
}

