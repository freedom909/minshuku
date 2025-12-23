// gateway/auth/auth-context.js
import { verifyAccessToken } from './verifyJwt';

export async function buildAuthContext(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return { user: null };
  }

  try {
    const token = auth.slice(7);
    const user = await verifyAccessToken(token);
    return { user };
  } catch (err) {
    return { user: null };
  }
}
