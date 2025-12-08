// services/fileService.js
import { Storage } from "@google-cloud/storage";
import { v4 as uuid } from "uuid";

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucketName = process.env.GCP_BUCKET_NAME;
const gcsBucket = storage.bucket(bucketName);

/**
 * Generate a signed URL (PUT) for uploading a file to GCS
 */
export async function getPresignedUrl({ userId, fileType }) {
  if (!userId) throw new Error("userId is required");
  if (!["front", "back", "selfie"].includes(fileType)) {
    throw new Error("Invalid fileType");
  }

  // path inside bucket
  const key = `mynumber/${userId}/${fileType}-${uuid()}.jpg`;

  const file = gcsBucket.file(key);

  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType: "image/jpeg",
  });

  return { uploadUrl, key };
}
