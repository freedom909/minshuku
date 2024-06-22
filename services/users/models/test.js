import mongoose from 'mongoose';
import User from './user.js';  // Ensure the correct relative path and file extension
import dotenv from 'dotenv';

dotenv.config();
// Connect to MongoDB
const uri = process.env.MONGODB_URL;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

const newUser = new User({
  email: 'example12@example.com',
  name: 'Example Name 1',
  role: 'GUEST',
  password: 'hashed_password',
  nickname: 'exampleNickname 1'
});

newUser.save()
  .then(user => {
    console.log('User saved:', user);
    mongoose.connection.close();  // Close the connection after the operation
  })
  .catch(err => {
    console.error('Error saving user:', err.message);
    mongoose.connection.close();  // Close the connection on error
  });
