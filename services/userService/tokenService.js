// // services/userService/tokenService.js
// import jwt from "jsonwebtoken";
// import fs from "fs";

// export default class TokenService {
//   constructor() {
//     const privateKeyPath = process.env.JWT_PRIVATE_KEY_PATH;
//     const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;

//     if (!privateKeyPath || !publicKeyPath) {
//       throw new Error("JWT key paths are not set");
//     }

//     this.privateKey = fs.readFileSync(privateKeyPath, "utf8");
//     this.publicKey = fs.readFileSync(publicKeyPath, "utf8");

//     this.algorithm = "RS256";
//     this.kid = "v2";
//   }

//   generateAccessToken({ userId, role }) {
//     return jwt.sign(
//       {
//         sub: userId,
//         role,
//         typ: "access",
//       },
//       this.privateKey,
//       {
//         algorithm: this.algorithm,
//         expiresIn: "15m",
//         keyid: this.kid,
//         issuer: "minshuku-auth",
//         audience: "minshuku-api",
//       }
//     );
//   }

//   verifyAccessToken(token) {
//     return jwt.verify(token, this.publicKey, {
//       algorithms: [this.algorithm],
//       issuer: "minshuku-auth",
//       audience: "minshuku-api",
//     });
//   }
// }


import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";

const PRIVATE_KEY = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const PUBLIC_KEY = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

export default class TokenService {
  signAccessToken(payload) {
    return jwt.sign(payload, PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: "15m",
    });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    });
  }

  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  hashRefreshToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}