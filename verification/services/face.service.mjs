// services/face.service.mjs
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-wasm';

// IMPORTANT: force ESM build
import * as faceapi from '@vladmandic/face-api/dist/face-api.esm.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initFaceApi() {
  await tf.setBackend('wasm');
  await tf.ready();

  console.log('[TF backend]', tf.getBackend());

  const modelPath = path.join(__dirname, '../models');

  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);

  console.log('[FaceAPI] models loaded');
}
export default initFaceApi;