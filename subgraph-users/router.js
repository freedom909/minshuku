import express from 'express';
import handleGoogleOAuth from './utils/handGoogleOAuth.js';


const router = express.Router();

router.post('/auth/google', async (req, res) => {
  console.log("✅ Google auth route hit");

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    // Delegate OAuth handling to the service
    const user = await handleGoogleOAuth(token);

    return res.json({ success: true, user });
  } catch (err) {
    console.error('OAuth error:', err);
    return res.status(500).json({ success: false, message: 'OAuth processing failed' });
  }
});

export default router;
