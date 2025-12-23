// services/auth/jwks.js
import fs from "fs";
import { importSPKI, exportJWK } from "jose";
import dotenv from "dotenv";
dotenv.config();


const PUBLIC_KEY_PATH = process.env.JWT_PUBLIC_KEY_PATH;

if (!PUBLIC_KEY_PATH) {
  throw new Error("JWT_PUBLIC_KEY_PATH is not set");
}

export async function getJWKS() {
  const pem = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");

  // 🔑 SPKI PEM → CryptoKey
  const publicKey = await importSPKI(pem, "RS256");

  // 🔑 CryptoKey → JWK
  const jwk = await exportJWK(publicKey);

  return {
    keys: [
      {
        kty: jwk.kty,     // RSA
        alg: "RS256",
        use: "sig",
        kid: "v2",
        n: jwk.n,
        e: jwk.e,
      },
    ],
  };
}
