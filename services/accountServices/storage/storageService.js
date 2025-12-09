// services/accountServices/storage/storageService.js
import { Storage } from "@google-cloud/storage";

export default class StorageService {
  constructor({ logger }) {
    this.logger = logger || console;

    if (!process.env.GCP_PROJECT_ID || !process.env.GCP_CLIENT_EMAIL || !process.env.GCP_PRIVATE_KEY) {
      this.logger.warn("GCP credentials are not fully configured. StorageService may not work.");
    }

    this.storage = new Storage({
      projectId: process.env.GCP_PROJECT_ID,
      credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    this.bucketName = process.env.GCP_BUCKET_NAME;
    this.encryptedPrefix = process.env.S3_ENCRYPTED_PREFIX || "encrypted/";
  }

  /**
   * Generate a short-lived URL for secure upload from frontend
   */
  async generatePresignedUrl({ fileKey, contentType, expiresIn = 300 }) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set.");

    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + expiresIn * 1000, // expiresIn is in seconds
      ContentType: contentType,
    };

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileKey);

    const [uploadUrl] = await file.getSignedUrl(options);
    return uploadUrl;
  }

  /**
   * Read GCS file into Buffer (for OCR, crypto, etc.)
   */
  async getObjectBuffer(fileKey) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set.");

    const [buffer] = await this.storage
      .bucket(this.bucketName)
      .file(fileKey)
      .download();
    return buffer;
  }

  /**
   * Upload processed / encrypted buffer
   */
  async putObjectBuffer(
    fileKey,
    buffer,
    contentType = "application/octet-stream"
  ) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set.");
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileKey);
    await file.save(buffer, {
      contentType,
      resumable: false, // Use simple upload for buffers
    });
  }

  /**
   * Safe file deletion
   */
  async deleteObject(fileKey) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set.");
    await this.storage.bucket(this.bucketName).file(fileKey).delete();
  }
}
