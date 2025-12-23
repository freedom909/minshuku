// services/accountServices/storage/presignRouter.js
import { Router } from "express";
import authMiddleware from "../../../infrastructure/auth/authMiddleware.js";

export default function presignRouter(container) {
  const router = Router();

  /**
   * Generate presigned upload URL
   * POST /file/presign-url
   */
  router.post("/presign-url", authMiddleware, async (req, res) => {
    try {
      const { fileName, fileType } = req.body;

      if (!fileName || !fileType) {
        return res.status(400).json({
          success: false,
          message: "fileName and fileType are required",
        });
      }

      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized (userId missing)",
        });
      }

      const storageService = container.resolve("storageService");

      // 👉 建议：按用户隔离文件路径
      const fileKey = `users/${req.user.userId}/${Date.now()}-${fileName}`;

      console.log("📦 Presign request:", {
        userId: req.user.userId,
        fileKey,
        fileType,
      });

      const url = await storageService.generatePresignedUrl({
        fileKey,
        contentType: fileType,
      });

      return res.json({
        success: true,
        url,
        fileKey,
      });
    } catch (err) {
      console.error("❌ PRESIGN FAILED");
      console.error("❌ MESSAGE:", err.message);
      console.error("❌ STACK:", err.stack);

      return res.status(500).json({
        success: false,
        message: "Presign failed",
        error: err.message,
      });
    }
  });

  return router;
}
