import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'water'; // Provide default DB name
console.log('MONGODB_URL:', mongoUrl);
console.log('DB_NAME:', dbName);

let isConnected = false;

async function connectToMongoDB() {
    if (!isConnected) {
        try {
            // Connect to MongoDB with Mongoose
            await mongoose.connect(mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                dbName: dbName,
            });
            isConnected = true;
            console.log('Connected to MongoDB with Mongoose');
        } catch (err) {
            console.error('Failed to connect to MongoDB:', err);
            throw err; // Re-throw the error to stop execution if connection fails
        }
    }
}

export default connectToMongoDB;



