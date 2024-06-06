// Load environment variables from .env file
require('dotenv').config();

const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.error("MONGODB_URL environment variable is not defined");
  process.exit(1);
}

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Define your migration logic here
    // For example, create a new collection, add a field to an existing collection, etc.
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
