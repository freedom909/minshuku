// services/userService/tokenService.js
import jwt from "jsonwebtoken";
import fs from "fs";

export default class TokenService {
  constructor() {
    const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;

    if (!privateKeyPath || !publicKeyPath) {
      throw new Error("JWT key paths are not set");
    }

    this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
    this.publicKey = fs.readFileSync(publicKeyPath, "utf8");

    this.algorithm = "RS256";
    this.kid = "v2";
  }

  generateAccessToken({ userId, role }) {
    return jwt.sign(
      {
        sub: userId,
        role,
        typ: "access",
      },
      this.privateKey,
      {
        algorithm: this.algorithm,
        expiresIn: "15m",
        keyid: this.kid,
        issuer: "minshuku-auth",
        audience: "minshuku-api",
      }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.publicKey, {
      algorithms: [this.algorithm],
      issuer: "minshuku-auth",
      audience: "minshuku-api",
    });
  }
}
