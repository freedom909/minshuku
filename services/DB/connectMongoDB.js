import pkg from 'mongodb';
const { MongoClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'air';
const client = new MongoClient(mongoUri);
let mongodb;

async function connectToMongoDB() {
    if (!mongodb) {
        try {
            await client.connect();
            console.log('✅ Connected to MongoDB');
            mongodb = client.db(dbName);
        } catch (error) {
            console.error('❌ MongoDB Connection Error:', error.message);
        }
    }
    return mongodb;
}

export default connectToMongoDB;