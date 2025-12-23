// gateway/auth/jwks-client.ts
import { createRemoteJWKSet } from 'jose';

const JWKS_URL = new URL(
  'http://auth-service:4010/.well-known/jwks.json'
  // 本地可用 http://localhost:4010/.well-known/jwks.json
);

export const jwks = createRemoteJWKSet(JWKS_URL, {
  cooldownDuration: 10_000,   // kid miss 后最少 10s 再拉
  timeoutDuration: 5_000,     // 请求超时
});
