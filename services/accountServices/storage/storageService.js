// services/accountServices/storage/storageService.js
import { Storage } from "@google-cloud/storage";

export default class StorageService {
  constructor({ logger }) {
    this.logger = logger || console;

    const {
      GCP_PROJECT_ID,
      GCP_CLIENT_EMAIL,
      GCP_PRIVATE_KEY,
      GCP_BUCKET_NAME,
    } = process.env;

    if (!GCP_PROJECT_ID || !GCP_CLIENT_EMAIL || !GCP_PRIVATE_KEY) {
      this.logger.warn("⚠️ GCP credentials are not fully configured.");
    }

    if (!GCP_BUCKET_NAME) {
      this.logger.warn("⚠️ GCP_BUCKET_NAME is not set.");
    }

    this.storage = new Storage({
      projectId: GCP_PROJECT_ID,
      credentials: {
        client_email: GCP_CLIENT_EMAIL,
        private_key: GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
    });

    this.bucketName = GCP_BUCKET_NAME;
    this.uploadPrefix = "uploads/"; // ✅ GCS friendly
  }

  /**
   * Generate a short-lived signed URL for direct upload
   */
  async generatePresignedUrl({ fileKey, contentType, expiresIn = 300 }) {
    if (!this.bucketName) {
      throw new Error("GCP_BUCKET_NAME is not set");
    }

    if (!fileKey) {
      throw new Error("fileKey is required");
    }

    if (!contentType) {
      throw new Error("contentType is required");
    }

    const options = {
      version: "v4",
      action: "write",
      expires: Date.now() + expiresIn * 1000,
      contentType, // ✅ 正确字段名
    };

    this.logger.info("📦 Generating GCS presigned URL", {
      bucket: this.bucketName,
      fileKey,
      contentType,
      expiresIn,
    });

    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileKey);

    const [uploadUrl] = await file.getSignedUrl(options);
    return uploadUrl;
  }

  async getObjectBuffer(fileKey) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set");
    const [buffer] = await this.storage
      .bucket(this.bucketName)
      .file(fileKey)
      .download();
    return buffer;
  }

  async putObjectBuffer(fileKey, buffer, contentType = "application/octet-stream") {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set");
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(fileKey);

    await file.save(buffer, {
      contentType,
      resumable: false,
    });
  }

  async deleteObject(fileKey) {
    if (!this.bucketName) throw new Error("GCP_BUCKET_NAME is not set");
    await this.storage.bucket(this.bucketName).file(fileKey).delete();
  }
}
