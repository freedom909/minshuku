// routes/fileRouter.js
import { Storage } from "@google-cloud/storage";
import express from "express";
import authMiddleware from "../../infrastructure/auth/authMiddleware.js";
import { getPresignedUrl } from "../services/fileService.js";

const router = express.Router();

/**
 * Optional health check
 */
router.get("/presign-url", (req, res) => {
  res.json({ message: "Use POST /presign-url" });
});

/**
 * POST → Generate GCS Signed URL
 */
router.post("/presign-url", authMiddleware, async (req, res) => {
  try {
    const { fileType } = req.body;

    if (!fileType) {
      return res.status(400).json({ error: "Missing fileType" });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (userId missing)" });
    }

    // 💡 Use the centralized fileService instead of raw gcsBucket
    const { uploadUrl, key } = await getPresignedUrl({
      userId,
      fileType,
    });

    return res.json({ uploadUrl, filePath: key });
  } catch (error) {
    console.error("🔥 PRESIGN ERROR:", error);
    res.status(500).json({ error: "Presign failed", details: error.message });
  }
});

export default router;
