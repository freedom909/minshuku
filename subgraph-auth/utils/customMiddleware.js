const customMiddleware = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token || token !== process.env.INTERNAL_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    // You can attach user info to the request if needed
    req.user = { role: 'admin' }; 
    next();
  };
  export default customMiddleware;