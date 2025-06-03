// middleware/rateLimitStore.js
const rateLimitMap = new Map();

async function applyRateLimiting(req, limit = 5, windowMs = 60_000) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const now = Date.now();

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }

  const timestamps = rateLimitMap.get(ip).filter(ts => now - ts < windowMs);
  timestamps.push(now);

  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > limit) {
    throw new GraphQLError("Too many requests", {
      extensions: { code: "TOO_MANY_REQUESTS" },
    });
  }
}
export default applyRateLimiting;