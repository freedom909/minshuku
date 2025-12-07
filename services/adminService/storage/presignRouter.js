// // routes/presignRouter.js
// import express from "express";
// import crypto from "crypto";
// import { container } from "../infrastructure/container/initializeAdminContainer.js"; // or however you import your awilix container

// const router = express.Router();

// /**
//  * POST /api/file/presign-url
//  * Body: { userId, side: "front"|"back"|"selfie", filename, contentType }
//  * Returns: { uploadUrl, fileKey }
//  */
// router.post("/presign-url", async (req, res) => {
//   try {
//     const { userId, side, filename, contentType } = req.body;
//     if (!userId || !side || !filename || !contentType) {
//       return res.status(400).json({ error: "userId, side, filename, contentType are required" });
//     }

//     const storage = container.resolve("storageService");
//     if (!storage) return res.status(500).json({ error: "Storage service not available" });

//     const ext = filename.split(".").pop();
//     const fileKey = `my-number/${userId}/${side}-${Date.now()}.${ext}`;

//     // StorageService.generatePresignedUrl accepts (fileKey, contentType, expiresIn)
//     const uploadUrl = await storage.generatePresignedUrl({
//       fileKey,
//       contentType,
//       expiresIn: parseInt(process.env.MAX_PRESIGN_EXPIRES || "300", 10),
//     });

//     return res.json({ uploadUrl, fileKey });
//   } catch (err) {
//     console.error("presign-url error:", err);
//     return res.status(500).json({ error: "Failed to generate presigned URL" });
//   }
// });

// export default router;

// infra/storage/presignRouter.js
import { Router } from 'express';

export default function presignRouter(container) {
  const router = Router();

  router.post('/presign', async (req, res) => {
    try {
      const { fileName, fileType } = req.body;
      const storageService = container.resolve('storageService');

      const fileKey = `myNumber/${Date.now()}-${fileName}`;
      const url = await storageService.generatePresignedUrl(fileKey, fileType);

      res.json({
        success: true,
        url,
        fileKey,
      });
    } catch (err) {
      console.error("Presign failed:", err);
      res.status(500).json({ success: false, message: "Presign failed" });
    }
  });

  return router;
}
