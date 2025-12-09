// services/accountServices/myNumberCard.service.js
import crypto from "crypto";
import vision from "@google-cloud/vision";

export default class MyNumberCardService {
  constructor({ ocrService, storageService, userRepository }) {
    this.ocrService = ocrService;
    this.storage = storageService;
    this.userRepository = userRepository;
    // Encryption master key (must be 32 bytes base64)
    this.masterKey = process.env.MYNUMBER_MASTER_KEY;
  }

  /** AES-256-GCM encrypt a buffer */
  encryptBuffer(buffer) {
    if (!this.masterKey) throw new Error("No master key configured");
    const key = Buffer.from(this.masterKey, "base64"); // must be 32 bytes

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    return { ciphertext, iv, tag };
  }

  /** Main verification logic */
  async verifyMyNumberCard({ userId, frontKey, backKey, selfieKey = null }) {
    // 1. Download images (from GCS or local storage)
    const frontBuf = await this.storage.getObjectBuffer(frontKey);
    const backBuf = await this.storage.getObjectBuffer(backKey);

    let selfieBuf = null;
    if (selfieKey) {
      selfieBuf = await this.storage.getObjectBuffer(selfieKey);
    }

    // 2. OCR using Google Vision
    const textFront = await this.ocrService.extractText(frontBuf);
    const textBack = await this.ocrService.extractText(backBuf);

    const parsed = this.parseMyNumberText(textFront + " " + textBack);

    // 3. Face comparison (GCP version)
    let faceMatch = false;

    try {
      if (selfieBuf) {
        // Detect faces in both images using ocrService
        const [frontFaces] = await this.ocrService.detectFaces(frontBuf);
        const [selfieFaces] = await this.ocrService.detectFaces(selfieBuf);

        const hasFrontFace = frontFaces.faceAnnotations?.length > 0;
        const hasSelfieFace = selfieFaces.faceAnnotations?.length > 0;

        // Replace AWS Rekognition face-match with simpler heuristic:
        // (In real production, compare landmarks or use Vertex AI Vision)
        faceMatch = hasFrontFace && hasSelfieFace;
      }
    } catch (err) {
      console.warn("Google Vision faceDetection error:", err);
    }

    // 4. Business decision
    const shouldApprove = faceMatch && parsed.name && parsed.birthdate;

    // 5. Encrypt both card images
    const encFront = this.encryptBuffer(frontBuf);
    const encBack = this.encryptBuffer(backBuf);

    const encFrontKey = `${this.storage.encryptedPrefix}${frontKey}`;
    const encBackKey = `${this.storage.encryptedPrefix}${backKey}`;

    const buildPayload = (iv, tag, ciphertext) =>
      Buffer.concat([iv, tag, ciphertext]);

    await this.storage.putObjectBuffer(
      encFrontKey,
      buildPayload(encFront.iv, encFront.tag, encFront.ciphertext),
      "application/octet-stream"
    );

    await this.storage.putObjectBuffer(
      encBackKey,
      buildPayload(encBack.iv, encBack.tag, encBack.ciphertext),
      "application/octet-stream"
    );

    // 6. Delete original raw card images
    await this.storage.deleteObject(frontKey).catch(() => {});
    await this.storage.deleteObject(backKey).catch(() => {});

    // 7. Update user role
    const updated = await this.userRepository.updateUserRole(
      userId,
      shouldApprove ? "HOST" : "PENDING_HOST"
    );

    return {
      success: shouldApprove,
      parsed,
      encryptedKeys: { front: encFrontKey, back: encBackKey },
      user: updated,
    };
  }

  /** Simple Japanese MyNumber text parsing */
  parseMyNumberText(text) {
    const cleanedText = text.replace(/\n/g, " ");
    const nameMatch = cleanedText.match(/([一-龥]+ ?[一-龥]+)/) || cleanedText.match(/([A-Za-z]+ [A-Za-z]+)/);
    const dateMatch = cleanedText.match(/(\d{4}\/\d{1,2}\/\d{1,2})|(\d{2,4}年\s*\d{1,2}月\s*\d{1,2}日)/);

    return {
      name: nameMatch ? nameMatch[0] : null,
      birthdate: dateMatch ? dateMatch[0] : null,
      raw: cleanedText,
    };
  }
}
