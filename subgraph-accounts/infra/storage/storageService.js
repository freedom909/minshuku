// services/storage/storageService.js
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default class StorageService {
  constructor({ logger }) {
    this.logger = logger || console;

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    this.bucket = process.env.AWS_BUCKET;
    this.encryptedPrefix = process.env.S3_ENCRYPTED_PREFIX || "encrypted/";
  }

  /**
   * Generate a short-lived URL for secure upload from frontend
   */
  async generatePresignedUrl({ fileKey, contentType = "image/png", expiresIn = 300 }) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      ContentType: contentType,
      ACL: "private", // Prevent public access
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Read S3 file into Buffer (for OCR, crypto, etc.)
   */
  async getObjectBuffer(fileKey) {
    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });

    const response = await this.s3.send(cmd);

    // Convert stream → Buffer safely
    return Buffer.from(await response.Body.transformToByteArray());
  }

  /**
   * Upload processed / encrypted buffer
   */
  async putObjectBuffer({ fileKey, buffer, contentType = "application/octet-stream" }) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: contentType,
      ACL: "private",
    });

    await this.s3.send(cmd);
  }

  /**
   * Safe file deletion
   */
  async deleteObject(fileKey) {
    const cmd = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    });
    await this.s3.send(cmd);
  }
}
