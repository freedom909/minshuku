// Authentication Middleware
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization || '';
    if (!token) {
      return res.status(401).json({ error: 'You must be logged in' });
    }
  
    try {
      const decodedToken = jwt.verify(token, JWT_SECRET); // Replace 'your-secret-key' with your actual secret
      req.user = decodedToken;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
  
  // Authorization Middleware
  export const authorize = (role) => (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'You must be logged in' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'You do not have the necessary permissions' });
    }
    next();
  };
