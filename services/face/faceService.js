import * as ort from "onnxruntime-node";
import sharp from "sharp";
import path from "path";
import fs from "fs";

// Model path
const modelPath = path.join(process.cwd(), "services/face/models/arcface_r100.onnx");

let session;

async function init() {
  if (!session) {
    if (!fs.existsSync(modelPath)) {
      throw new Error("ArcFace model not found at: " + modelPath);
    }
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ["cpu"]
    });
    console.log("🧠 ArcFace model initialized");
  }
  return session;
}

async function imageToTensor(buffer) {
  const image = sharp(buffer).resize(112, 112).removeAlpha().raw();
  const { data, info } = await image.toBuffer({ resolveWithObject: true });
  const floatData = Float32Array.from(data, (v) => v / 255.0);
  return new ort.Tensor("float32", floatData, [1, 3, info.height, info.width]);
}

async function getEmbedding(buffer) {
  await init();
  const tensor = await imageToTensor(buffer);
  const outputs = await session.run({ input: tensor });
  const embedding = outputs.output.data;
  return normalize(embedding);
}

function normalize(arr) {
  const norm = Math.sqrt(arr.reduce((acc, v) => acc + v * v, 0));
  return arr.map(v => v / norm);
}

function cosineSimilarity(a, b) {
  const product = a.reduce((acc, v, i) => acc + v * b[i], 0);
  return product;
}

export default {
  getEmbedding,
  cosineSimilarity
};
