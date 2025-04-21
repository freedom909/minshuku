import connectToMongoDB from "../DB/connectMongoDB.js";
import dotenv from 'dotenv';

dotenv.config();

const mockData = [
    {
        text: "I love this project!",
        label: "Positive",
        score: 0.95,
        createdAt: new Date()
    },
    {
        text: "This is terrible...",
        label: "Negative",
        score: 0.89,
        createdAt: new Date()
    },
    {
        text: "Not bad, could be better.",
        label: "Neutral",
        score: 0.6,
        createdAt: new Date()
    }
];

async function insertMockData() {
    try {
        const db = await connectToMongoDB();
        const result = await db.collection('sentiments').insertMany(mockData);
        console.log(`✅ Inserted ${result.insertedCount} mock records.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to insert mock data:', err);
        process.exit(1);
    }
}

insertMockData();
