import jwt from 'jsonwebtoken';
import { privateKey } from './key-loader.js';
import crypto from 'crypto';

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

  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  verifyAccessToken(token) {

  }
  verifyRefreshToken(token) { }

  async refresh(refreshToken) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userService.findById(payload.sub);

    return this.issueTokens(user);
  }

  async rotateRefreshToken(oldToken) {
    const tokenHash = this.tokenService.hashRefreshToken(oldToken);
    const stored = await this.refreshRepo.findValid(tokenHash);

    if (!stored) {
      throw new Error("Refresh token reuse detected");
    }

    // revoke old
    stored.revokedAt = new Date();

    // create new
    const newToken = this.tokenService.generateRefreshToken();
    const newHash = this.tokenService.hashRefreshToken(newToken);

    await this.refreshRepo.create({
      userId: stored.userId,
      tokenHash: newHash,
      expiresAt: addDays(30),
    });

    stored.replacedByTokenId = newToken.id;
    await stored.save();

    const user = await this.userService.findById(stored.userId);

    return {
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        role: user.role,
      }),
      refreshToken: newToken,
      user,
    };
  }

}
