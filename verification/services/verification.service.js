import { createRequire } from "module";
import Verification from "../../services/models/verification.js";

const require = createRequire(import.meta.url);

// 🔥 Import CJS ML island safely
const faceService = require("./face.service.mjs");

export default {
  async verify({ userId, frontKey, backKey, selfieKey }) {

    const faceMatch = await faceService.compareFaces({
      idImageKey: frontKey,
      selfieKey
    });

    const record = await Verification.create({
      userId,
      frontKey,
      backKey,
      selfieKey,
      faceMatched: faceMatch,
      status: faceMatch ? "APPROVED" : "REJECTED"
    });

    return record;
  }
};

