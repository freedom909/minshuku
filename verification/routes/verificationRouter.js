// routes/verificationRouter.js
import { Router } from "express";
import { submitVerification } from "../controllers/verificationController.js";
import authMiddleware from "../../infrastructure/auth/authMiddleware.js";

const router = Router();

router.post("/submit", authMiddleware, submitVerification);

export default router;
