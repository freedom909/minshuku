// import mongoose, { connect } from 'mongoose';

// import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URL;

connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err.message));

export default mongoose;
