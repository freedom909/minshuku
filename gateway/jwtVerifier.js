import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS_URL = new URL(
  "http://subgraph-auth:4010/.well-known/jwks.json"
);

const jwks = createRemoteJWKSet(JWKS_URL);

export async function verifyJWT(token) {
  const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    issuer: "minshuku-auth",
    audience: "minshuku-api",
  });

  return {
    userId: payload.sub,
    role: payload.role,
    kid: protectedHeader.kid,
  };
}
