import Tesseract from "tesseract.js";
import fs from "fs";

export async function extractText(imagePath) {
  const result = await Tesseract.recognize(imagePath, "jpn", {
    logger: m => console.log(m)
  });

  return result.data.text;
}
