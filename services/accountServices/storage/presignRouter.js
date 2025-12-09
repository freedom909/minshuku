// services/accountServices/storage/presignRouter.js
import { Router } from 'express';

export default function presignRouter(container) {
  const router = Router();

  router.post('/presign-url', async (req, res) => {
    try {
      const { fileKey, contentType } = req.body;
      const storageService = container.resolve('storageService');

      const url = await storageService.generatePresignedUrl({ fileKey, contentType });

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
