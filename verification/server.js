// server.js
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import verificationRouter from './routes/verificationRouter.js';

const app = express();
app.use(express.json());

app.use("/verify", verificationRouter);

await mongoose.connect(MONGO_URI);
console.log("✅ MongoDB connected");

app.listen(4001, () => {
  console.log("🚀 Verification API running at http://localhost:4001");
});
