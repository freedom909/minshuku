import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const sentimentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Sentiment = mongoose.model("Sentiment", sentimentSchema);
