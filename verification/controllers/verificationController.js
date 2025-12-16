// controllers/verificationController.js
import { validationResult } from 'express-validator';
import User from '../../services/models/user.js';
import { runVerificationWorkflow } from "../services/verificationWorkflow.js";

import verificationService from "../services/verification.service.js";

export async function submitVerification(req, res) {
  const userId = req.user.id;
  const { frontKey, backKey, selfieKey } = req.body;

  const result = await verificationService.verify({
    userId,
    frontKey,
    backKey,
    selfieKey
  });

  res.json(result);
}
