// src/services/ocr/ocrService.js
import vision from "@google-cloud/vision";

export default class OcrService {
  constructor({ logger }) {
    this.logger = logger || console;

    // Google Vision API client
    this.client = new vision.ImageAnnotatorClient();
  }

  /**
   * OCR MyNumber front card
   * @param {Buffer} buffer - front card image buffer
   * @returns parsed result: { rawText, fields }
   */
  async extractMyNumberFields(buffer) {
    try {
      const [result] = await this.client.textDetection(buffer);

      if (!result || !result.textAnnotations || result.textAnnotations.length === 0) {
        throw new Error("Unable to extract text from card");
      }

      const rawText = result.textAnnotations[0].description;
      const lines = rawText.split("\n").map((l) => l.trim());

      // --------------------------------------------
      //  VERY LIGHT parsing (Japanese MyNumber front)
      //  We DO NOT parse the 12-digit number (law)
      // --------------------------------------------
      const fields = {
        name: null,
        address: null,
        birthDate: null,
        expiryDate: null,
        rawText,
      };

      for (const line of lines) {
        if (/氏名|名前/i.test(line)) {
          fields.name = line.replace(/氏名|名前/gi, "").trim();
        }
        if (/住所/i.test(line)) {
          fields.address = line.replace(/住所/gi, "").trim();
        }
        if (/生年月日/i.test(line)) {
          fields.birthDate = line.replace(/生年月日/gi, "").trim();
        }
        if (/有効期限/i.test(line)) {
          fields.expiryDate = line.replace(/有効期限/gi, "").trim();
        }
      }

      return { rawText, fields };

    } catch (err) {
      this.logger.error("OCR failed:", err);
      throw err;
    }
  }
}
