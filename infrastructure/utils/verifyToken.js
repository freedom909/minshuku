import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET); // returns the decoded user
  } catch (err) {
    return null;
  }
};
