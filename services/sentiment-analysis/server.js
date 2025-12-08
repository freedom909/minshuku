import express, { json } from "express";
import axios from "axios";
import dotenv from 'dotenv';
import mongodb from 'mongodb';
import { Sentiment } from "./models/Sentiment.js";
import neo4j from "neo4j-driver";

console.log("Starting server...");
dotenv.config();
console.log("Environment variables loaded");

// Connect to MongoDB
console.log("Connecting to MongoDB...");
console.log("MongoDB URL:", process.env.MONGO_URL || 'mongodb://localhost:27017/air');
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/air')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        console.error(err.stack);
    });

// Connect to Neo4j
console.log("Connecting to Neo4j...");
console.log("Neo4j URI:", process.env.NEO4J_URI || "bolt://localhost:7687");
console.log("Neo4j Username:", process.env.NEO4J_USERNAME);
const user = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;
const url = process.env.NEO4J_URI;
try {
    const driver = neo4j.driver(
        url || "bolt://localhost:7687",
        neo4j.auth.basic(user, password)
    );
    const session = driver.session();
    console.log("✅ Connected to Neo4j");
} catch (error) {
    console.error("❌ Neo4j Connection Error:", error);
    console.error(error.stack);
}

const app = express();
app.use(json());

const FASTAPI_URL = "http://localhost:8000/classify/";

app.post("/analyze-sentiment", async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const response = await axios.get(`${FASTAPI_URL}?text=${encodeURIComponent(text)}`);
        const { label, score } = response.data;

        // Store in MongoDB
        const sentimentEntry = new Sentiment({ text, label, score });
        await sentimentEntry.save();

        res.json({ text, label, score });
    } catch (error) {
        console.error("Error calling FastAPI:", error);
        res.status(500).json({ error: "Sentiment analysis failed" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Node.js server running on port ${PORT}`);
});
