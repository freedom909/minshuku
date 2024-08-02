import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';  // Adjust the path as necessary
import usersData from './users.json' assert { type: "json"};  // Adjust the path as necessary

dotenv.config();

const mongoUrl =  'mongodb://localhost:27017/air';

const seedDatabase = async () => {
    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         
        });
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        console.log('Cleared existing user data');

        // Insert new data
        await User.insertMany(usersData);
        console.log('Inserted user data');

        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding database:', error);
        mongoose.disconnect();
    }
};

seedDatabase();
