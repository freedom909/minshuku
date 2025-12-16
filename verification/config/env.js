import dotenv from "dotenv";
dotenv.config();

export const {
  MONGO_URI,
  GCP_BUCKET_NAME
} = process.env;
