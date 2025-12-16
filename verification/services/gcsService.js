import { Storage } from '@google-cloud/storage';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    // It's good practice to handle cases where the key might be missing
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n")
  }
});

export async function downloadTempFile(bucketName, fileKey) {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `${Date.now()}-${path.basename(fileKey)}`);

  try {
    const bucket = storage.bucket(bucketName);
    await bucket.file(fileKey).download({ destination: tempPath });
    console.log(`Successfully downloaded ${fileKey} to ${tempPath}`);
    return tempPath;
  } catch (error) {
    console.error(`Failed to download file from GCS: ${fileKey}`, error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

export async function cleanupTempFile(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
    console.log(`Successfully cleaned up temp file: ${filePath}`);
  } catch (error) {
    // Log the error but don't block execution if cleanup fails
    console.warn(`Failed to clean up temp file: ${filePath}`, error);
  }
}
