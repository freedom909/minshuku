import jwt from 'jsonwebtoken';
import { privateKey } from './key-loader.js';

export class TokenService {
  constructor() {
    this.issuer = 'minshuku-auth';
    this.audience = 'minshuku-app';
    this.algorithm = 'RS256';
    this.keyId = 'v2';
  }

  signAccessToken(payload, expiresIn = '15m') {
    return jwt.sign(payload, privateKey, {
      algorithm: this.algorithm,
      keyid: this.keyId,
      expiresIn,
      issuer: this.issuer,
      audience: this.audience,
    });
  }

  signRefreshToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, privateKey, {
      algorithm: this.algorithm,
      keyid: this.keyId,
      expiresIn,
      issuer: this.issuer,
      audience: this.audience,
    });
  }
}
