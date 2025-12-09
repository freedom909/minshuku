// services/accountServices/ocr/ocrService.js
import vision from "@google-cloud/vision";

export default class OcrService {
  constructor() {
    this.visionClient = new vision.ImageAnnotatorClient();
  }

  /**
   * Extracts text from an image buffer using Google Cloud Vision API.
   * @param {Buffer} imageBuffer - The image data as a Buffer.
   * @returns {Promise<string>} The extracted raw text.
   */
  async extractText(imageBuffer) {
    const [result] = await this.visionClient.textDetection({ image: { content: imageBuffer } });
    const fullText = result.fullTextAnnotation?.text || "";
    return fullText.replace(/\n/g, " ");
  }

  /**
   * Detects faces in an image buffer using Google Cloud Vision API.
   * @param {Buffer} imageBuffer - The image data as a Buffer.
   * @returns {Promise<Array>} An array of face annotations.
   */
  async detectFaces(imageBuffer) {
    const [result] = await this.visionClient.faceDetection({ image: { content: imageBuffer } });
    return result.faceAnnotations || [];
  }
}