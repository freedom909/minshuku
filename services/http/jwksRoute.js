// services/http/jwksRoute.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwkToPem from "jwk-to-pem";
import { pem2jwk } from "pem-jwk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct path relative to the current module file, assuming keys are in `services/keys/`
const publicKeyPath = path.resolve(__dirname, "../../keys/jwt-public.pem");
const publicKeyPem = fs.readFileSync(publicKeyPath);

const jwk = pem2jwk(publicKeyPem);
jwk.use = "sig";
jwk.alg = "RS256";
jwk.kid = "auth-key-1";

export default function jwksRoute(req, res) {
  res.json({
    keys: [jwk],
  });
}
