import fs from "fs";
import { importPKCS8, importSPKI } from "jose";

export const privateKeys = {};
export const publicKeys = {};

async function loadKeys() {
  const privatePath = process.env.JWT_PRIVATE_KEY_PATH;
  const publicPath  = process.env.JWT_PUBLIC_KEY_PATH;

  if (!privatePath || !publicPath) {
    throw new Error("JWT_PRIVATE_KEY_PATH or JWT_PUBLIC_KEY_PATH is not set");
  }

  privateKeys.v2 = await importPKCS8(
    fs.readFileSync(privatePath, "utf8"),
    "RS256"
  );

  publicKeys.v2 = await importSPKI(
    fs.readFileSync(publicPath, "utf8"),
    "RS256"
  );
}

await loadKeys();
