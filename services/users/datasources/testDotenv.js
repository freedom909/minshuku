import dotenv from 'dotenv';

// Ensure dotenv is configured before any other code
dotenv.config();

// Debugging statement to verify the environment variable
console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('DB_NAME:', process.env.DB_NAME);
