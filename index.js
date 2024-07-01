// Import necessary modules
import { MongoClient } from 'mongodb';
import AuthService from './infrastructure/repositories/authService.js';
import UserRepository from './infrastructure/repositories/userRepository.js';
import dotenv from 'dotenv';
dotenv.config();

// Connection URL and Database Name
const uri= process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function main() {
    console.log('Connecting to:', uri, dbName);
  // Create a new MongoClient
  const client = new MongoClient(uri);

  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected successfully to server');

    // Get the database
    const db = client.db(dbName);

    // Initialize repositories and services
    const userRepository = new UserRepository(db);
    const authService = new AuthService(userRepository);

    // Test the login function
    const loginResponse = await authService.login({ email: "just4@gmail.com", password: "cc17b44ada" });
    console.log('Login response:', loginResponse);

  } catch (err) {
    console.error('Error during login process:', err);
  } finally {
    // Close the connection to the database
    await client.close();
  }
}

// Run the main function
main().catch(console.error);
