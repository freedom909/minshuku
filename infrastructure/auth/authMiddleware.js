import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1. Extract Bearer token
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.replace("Bearer ", "");
    }

    // 2. Extract cookie token
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Service-to-service auth
    if (req.headers['x-service-token']) {
      try {
        const decoded = jwt.verify(
          req.headers['x-service-token'],
          process.env.SERVICE_SECRET
        );

        if (decoded.type === "service") {
          req.service = decoded;
          return next();
        }
      } catch (err) {
        return res.status(401).json({ error: "Invalid service token" });
      }
    }

    // 4. User auth
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // contains userId, email, etc.
    next();

  } catch (err) {
    console.error("Auth ERROR:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}