import User from "../../services/models/user.js";
import { downloadTempFile } from "./gcsService.js";
import { extractText } from "./ocrService.js";
import pkg from './face.service.mjs';
const { compareFaces } = pkg;

const BUCKET = "minshuku-bucket";

export async function runVerificationWorkflow(userId) {
  console.log("Running verification workflow for user:", userId);

  const user = await User.findById(userId);
  if (!user) return;

  const { frontKey, backKey, selfieKey } = user.hostVerification;

  // 1. Download files
  const frontPath = await downloadTempFile(BUCKET, frontKey);
  const backPath = await downloadTempFile(BUCKET, backKey);
  const selfiePath = await downloadTempFile(BUCKET, selfieKey);

  // 2. OCR from MyNumber front
  const ocrText = await extractText(frontPath);

  // Validate name (optional)
  const nameMatches = user.name && ocrText.includes(user.name);

  // 3. Face recognition
  const faceMatches = await compareFaces(frontPath, selfiePath);

  // 4. Decision
  const approved = faceMatches && nameMatches;

  user.hostVerification.reviewedAt = new Date();
  user.hostVerification.result = approved ? "approved" : "rejected";
  user.hostStatus = approved ? "APPROVED" : "REJECTED";
  user.kycVerified = approved;

  await user.save();

  console.log("Verification finished:", approved ? "APPROVED" : "REJECTED");
}
