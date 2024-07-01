import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function insertTestUser() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const testUser = {
      email: 'example@example.com',
      name: 'John Doe',
      password: hashedPassword,
      nickname: 'johndoe',
      role: 'GUEST',
      picture: 'profile.jpg'
    };

    await usersCollection.insertOne(testUser);
    console.log('Test user inserted:', testUser);
  } finally {
    await client.close();
  }
}

insertTestUser().catch(console.error);
