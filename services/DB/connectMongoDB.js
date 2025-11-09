import mongoose from 'mongoose';

export default async function connectToMongoDB(mongoUri) {
    try {
        console.log("MONGO_URI:", mongoUri);
        console.log("Loading MONGO_URI from env:", process.env.MONGO_URI);
        console.log("All env variables:", process.env);
        const MONGO_URI =  'mongodb://localhost:27017/air'||process.env.MONGO_URI ;

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        console.log('✅ Connected to MongoDB via Mongoose');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        throw error;
    }
}
