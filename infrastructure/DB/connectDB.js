import pkg from 'mongodb';
const {MongoClient} = pkg;

import dotenv from 'dotenv';

const uri=process.env.MONGODB_URI; ;
const dbName=process.env.DB_NAME;

let db;

export async function connectToDatabase() {
  if (!db) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

