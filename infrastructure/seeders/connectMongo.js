import mongoose from 'mongoose';

const connectToMongoDB = async () => {
  const mongoURI = 'mongodb://localhost:27017/air'; // Replace with your MongoDB URI

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Increase timeout
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectToMongoDB;
