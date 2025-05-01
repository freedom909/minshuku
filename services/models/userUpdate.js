import mongoose from 'mongoose';
import User from './user.js'; // adjust path if needed
const MONGO_URI = 'mongodb://localhost:27017/air'; // 
await User.updateMany({}, { $unset: { providerId: "" } });
