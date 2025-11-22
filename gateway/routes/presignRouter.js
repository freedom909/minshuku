import express from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const router = express.Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }
});

router.post("/presign-url", async (req, res) => {
  const { userId, fileType } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const fileId = crypto.randomUUID();
  const key = `mynumber/${userId}/${fileType}/${fileId}.jpg`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ContentType: "image/jpeg",
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.json({
      uploadUrl,
      key,
      expiresIn: 3600
    });
  } catch (err) {
    console.error("S3 Presign Error:", err);
    res.status(500).json({ error: "Failed presign" });
  }
});

export default router;
