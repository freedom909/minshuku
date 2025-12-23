// services/auth/key-loader.ts
import fs from 'fs';
import crypto from 'crypto';

const PRIVATE_KEY_PATH = process.env.JWT_PRIVATE_KEY_PATH;
if (!PRIVATE_KEY_PATH) {
  throw new Error('JWT_PRIVATE_KEY_PATH is not set');
}

export const privateKey = crypto.createPrivateKey(
  fs.readFileSync(PRIVATE_KEY_PATH, 'utf8')
);
