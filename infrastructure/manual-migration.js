// manual-migration.js

const mongoose =require('mongoose');
const dotenv = require('dotenv');
require('dotenv').config()



// Define the user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String },
  refresh_token: { type: String },
  picture: { type: String },
  description: { type: String },
  nickname: { type: String },
});

// Create the user model
const User = mongoose.model('User', userSchema);

// Connect to the MongoDB database
const uri = process.env.MONGODB_URL;
if (!uri) {
  console.error("MONGODB_URL not found in .env file");
  process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected');
    insertUser();
  })
  .catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
  });

// Function to insert a new user
async function insertUser() {
  try {
    const newUser = new User({
      email: 'example@example.com',
      name: 'Example User',
      role: 'user',
      password: 'password123', // In a real-world scenario, ensure the password is hashed
      token: '',
      refresh_token: '',
      picture: '',
      description: 'This is an example user',
      nickname: 'ExampleNick',
    });

    const result = await newUser.save();
    console.log('User inserted:', result);
  } catch (error) {
    console.error('Error inserting user:', error);
  } finally {
    mongoose.connection.close();
  }
}
