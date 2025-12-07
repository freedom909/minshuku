// services/myNumberCard.service.js
import { createContainer, asValue, asClass } from 'awilix';
import crypto from "crypto";
// import { StorageService } from "./storage/storageService.js";
// import UserRepository from "../repositories/userRepository.js";
// import OcrService from "./ocr/ocrService.js";
import AWS from "aws-sdk";

// Google Vision client (for OCR)
import vision from "@google-cloud/vision";

export default class MyNumberCardService {
  constructor({ocrService, storageService, userRepository }) {
    this.ocrService = ocrService;//what should it have something to do with ocrService?
    this.storage = storageService;
    this.userRepository = userRepository;
    // AWS Rekognition client (for face compare)
    this.rekognition = new AWS.Rekognition({ region: process.env.AWS_REKOGNITION_REGION });
    // Google Vision client
    this.visionClient = new vision.ImageAnnotatorClient();
    // encryption key could be from KMS or environment - for demo keep env
    // PRODUCTION: use AWS KMS to manage keys instead of env variable
    this.masterKey = process.env.MYNUMBER_MASTER_KEY; // 32 bytes base64 or similar (prefer KMS)
  }

  // AES-256-GCM encrypt buffer -> returns {ciphertext, iv, tag}
  encryptBuffer(buffer) {
    if (!this.masterKey) throw new Error("No master key configured");
    const key = Buffer.from(this.masterKey, "base64"); // must be 32 bytes
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { ciphertext, iv, tag };
  }

  // Main verify function
  async verifyMyNumberCard({ userId, frontKey, backKey, selfieKey = null }) {
    // 1. download images from S3
    const frontBuf = await this.storage.getObjectBuffer(frontKey);
    const backBuf = await this.storage.getObjectBuffer(backKey);

    // optional selfie: if frontend also uploads selfie separately
    let selfieBuf = null;
    if (selfieKey) selfieBuf = await this.storage.getObjectBuffer(selfieKey);

    // 2. OCR with Google Vision (front + back)
    const ocrFront = await this.visionClient.textDetection({ image: { content: frontBuf } });
    const ocrBack = await this.visionClient.textDetection({ image: { content: backBuf } });
    const textFront = (ocrFront[0].fullTextAnnotation?.text || "").replace(/\n/g, " ");
    const textBack = (ocrBack[0].fullTextAnnotation?.text || "").replace(/\n/g, " ");

    // parse name, birthday (very heuristic — production requires better parser)
    const parsed = this.parseMyNumberText(textFront + " " + textBack);

    // 3. face compare: use Rekognition.compareFaces
    // If selfie provided, compare card->selfie. Else compare front/back if card has face on front.
    let faceMatch = false;
    try {
      if (selfieBuf) {
        const params = {
          SourceImage: { Bytes: frontBuf },
          TargetImage: { Bytes: selfieBuf },
          SimilarityThreshold: 80
        };
        const resp = await this.rekognition.compareFaces(params).promise();
        faceMatch = (resp.FaceMatches && resp.FaceMatches.length > 0);
      } else {
        // if no selfie, skip or set to false
        faceMatch = false;
      }
    } catch (err) {
      console.warn("Rekognition error:", err);
    }

    // 4. Decide result (business rule)
    const shouldApprove = faceMatch && parsed.name && parsed.birthdate;

    // 5. If approved (or always store securely), encrypt both images and store
    const encFront = this.encryptBuffer(frontBuf);
    const encBack = this.encryptBuffer(backBuf);

    // Build encrypted keys
    const encFrontKey = `${this.storage.encryptedPrefix}${frontKey}`;
    const encBackKey = `${this.storage.encryptedPrefix}${backKey}`;

    // Store encrypted payloads (we'll store iv + tag + ciphertext concatenated or JSON)
    const buildPayload = (iv, tag, ciphertext) => {
      // Store as: iv(12) + tag(16) + ciphertext
      return Buffer.concat([iv, tag, ciphertext]);
    };

    await this.storage.putObjectBuffer(encFrontKey, buildPayload(encFront.iv, encFront.tag, encFront.ciphertext), "application/octet-stream");
    await this.storage.putObjectBuffer(encBackKey, buildPayload(encBack.iv, encBack.tag, encBack.ciphertext), "application/octet-stream");

    // 6. Delete original plain objects to minimize exposure
    await this.storage.deleteObject(frontKey).catch(() => {});
    await this.storage.deleteObject(backKey).catch(() => {});

    // 7. Update user role to PENDING_HOST (or HOST if auto approval)
    const updated = await this.userRepository.updateUserRole(userId, shouldApprove ? "HOST" : "PENDING_HOST");

    // 8. Audit log (implement your logger)
    // logger.info('myNumberVerify', { userId, frontKey: encFrontKey, backKey: encBackKey, result: shouldApprove });

    return {
      success: shouldApprove,
      parsed,
      encryptedKeys: { front: encFrontKey, back: encBackKey },
      user: updated
    };
  }

  parseMyNumberText(text) {
    // Heuristic parser: production should use deterministic OCR + regex for Japanese formats.
    // This is a placeholder: extract first Kanji name-like token, date-like token etc.
    const nameMatch = text.match(/([一-龥]+ ?[一-龥]+)/) || text.match(/([A-Za-z]+ [A-Za-z]+)/);
    const dateMatch = text.match(/(\d{4}\/\d{1,2}\/\d{1,2})|(\d{2,4}年\s*\d{1,2}月\s*\d{1,2}日)/);
    return {
      name: nameMatch ? nameMatch[0] : null,
      birthdate: dateMatch ? dateMatch[0] : null,
      raw: text
    };
  }
}
