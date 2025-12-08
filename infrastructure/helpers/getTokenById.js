// helpers/getTokenById.js
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import connectToMongoDB from "../../services/DB/connectMongoDB.js";

// Resolve paths based on this file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Prepare absolute file:// URL for dynamic import
const userModelPath = path.resolve(__dirname, "../../services/models/user.js");
const userModelUrl = pathToFileURL(userModelPath).href;

// ⬅️ FIX: import using file:// URL
const { default: User } = await import(userModelUrl);

async function getTokenById(userId, expiry = "7d") {
  await connectToMongoDB();
  

  const user = await User.findById(userId);
  if (!user) {
    console.error("❌ User not found:", userId);
    process.exit(1);
  }

  const payload = {
    id: user._id.toString(),
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiry,
  });

  console.log("✅ Token:", token);

  await mongoose.disconnect();
  return token;
}

// Run directly: node helpers/getTokenById.js <userId>
if (process.argv[2]) getTokenById(process.argv[2]);

export default getTokenById;
