// File: infrastructure/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../../services/models/user.js'

export function decodeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    return decoded.userId;
  } catch (err) {
    return null;
  }
}


// Middleware to check if the user has permission to view listings
export const checkPermissions = async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findOne({ where: { id: req.user.id } });

  if (!user || (user.id !== parseInt(userId) && user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
