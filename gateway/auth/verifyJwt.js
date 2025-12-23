// gateway/auth/verify-jwt.js
import { jwtVerify } from 'jose';
import { jwks } from './jwksClient';

const ISSUER = 'minshuku-auth';
const AUDIENCE = 'minshuku-app';

export async function verifyAccessToken(token) {
  const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithms: ['RS256'],
  });

  return {
    userId: payload.sub,
    email: payload.email,
    role: payload.role,
    kid: protectedHeader.kid,
  };
}
