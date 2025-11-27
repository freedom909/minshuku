// subgraph-accounts/infra/ai/myNumberCardService.js

import * as faceapi from '@vladmandic/face-api';
import * as canvas from 'canvas';
import Tesseract from 'tesseract.js';
import crypto from 'crypto';

const AES_SECRET = process.env.AES_SECRET || crypto.randomBytes(32);
const AES_IV = process.env.AES_IV || crypto.randomBytes(16);

// Attach Node canvas env to face-api
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });


export class MyNumberCardService {
  constructor({ storageService, userService }) {
    this.storageService = storageService;
    this.userService = userService;
  }

  async init() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./models');
  }


  async verifyMyNumberCard({ userId, frontKey, backKey, selfieKey }) {
    console.log("Starting verification for:", userId);

    // ⬇ Download buffers from S3
    const frontImgBuf = await this.storageService.getObjectBuffer(frontKey);
    const selfieBuf = await this.storageService.getObjectBuffer(selfieKey);

    // ⬇ OCR extract the ID number from front card
    const { data: ocrResult } = await Tesseract.recognize(frontImgBuf, "jpn");
    const extractedId = this._extractMyNumberFromText(ocrResult.text);

    if (!extractedId) {
      return { success: false, message: "Failed to extract MyNumber ID" };
    }

    console.log("OCR MyNumber:", extractedId);

    // ⬇ Compare face in card vs selfie
    const faceMatch = await this._compareFaces(frontImgBuf, selfieBuf);

    if (!faceMatch.match) {
      return { success: false, message: "Face does not match card" };
    }

    // ⬇ Encrypt card & store new encrypted objects
    await this._encryptAndStore(frontKey);
    await this._encryptAndStore(backKey);
    await this._encryptAndStore(selfieKey);

    // ⬇ Update DB: role = PENDING_HOST
    await this.userService.updateUserRole(userId, "PENDING_HOST");

    return {
      success: true,
      message: "Verification success. Pending admin approval.",
      score: faceMatch.score
    };
  }


  _extractMyNumberFromText(text) {
    const match = text.replace(/\D/g, "").match(/\d{12}/);
    return match ? match[0] : null;
  }


  async _compareFaces(buf1, buf2) {
    const img1 = await canvas.loadImage(buf1);
    const img2 = await canvas.loadImage(buf2);

    const det1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const det2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

    if (!det1 || !det2) return { match: false, score: 0 };

    const distance = faceapi.euclideanDistance(det1.descriptor, det2.descriptor);
    const threshold = 0.45;

    return { match: distance < threshold, score: (1 - distance).toFixed(3) };
  }


  async _encryptAndStore(fileKey) {
    const plainBuffer = await this.storageService.getObjectBuffer(fileKey);

    // AES Encryption
    const cipher = crypto.createCipheriv('aes-256-cbc', AES_SECRET, AES_IV);
    let encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);

    const encryptedKey = `encrypted/${fileKey}`;

    await this.storageService.putObjectBuffer(encryptedKey, encrypted);
    await this.storageService.deleteObject(fileKey);

    return encryptedKey;
  }
}

