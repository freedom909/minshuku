import express from "express";
import crypto from "crypto";
import { Storage } from "@google-cloud/storage";

const router = express.Router();

if (
  !process.env.GCP_PROJECT_ID ||
  !process.env.GCP_CLIENT_EMAIL ||
  !process.env.GCP_PRIVATE_KEY ||
  !process.env.GCP_BUCKET_NAME
) {
  throw new Error("Missing required GCS env variables (GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, GCP_BUCKET_NAME).");
}

// Initialize GCS
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

// Simple GET
router.get("/presign-url", (req, res) => {
  res.json({ message: "Use POST for actual presigned URL" });
});

// POST to generate signed upload URL
router.post("/presign-url", async (req, res) => {
  const { userId, fileType } = req.body;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const fileId = crypto.randomUUID();
  const key = `mynumber/${userId}/${fileType}/${fileId}.jpg`;

  try {
    const file = bucket.file(key);

    // Generate V4 signed upload URL
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
      contentType: "image/jpeg",
    });

    res.json({
      uploadUrl: url,
      key,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error("GCS Presign Error:", error);
    res.status(500).json({ error: "Failed to generate GCS presigned URL" });
  }
});

export default router;
