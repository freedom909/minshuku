// infrastructure/createContext.js
import jwt from 'jsonwebtoken';

export const createContext = async ({ req }) => {
  const token = req.headers.authorization?.split(" ")[1] || '';
  console.log("AUTH HEADER:", req.headers.authorization);

  let user = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user = { id: decoded.userId }; // extract userId from token payload
    } catch (err) {
      console.warn("Invalid token:", err.message);
    }
  }

  return {
    token,
    user,
    dataSources: {
      listingService: mysqlContainer.resolve('listingService'),
      locationService: mysqlContainer.resolve('locationService'),
      amenityService: mysqlContainer.resolve('amenityService'),
      userService: mongoContainer.resolve('userService'),
    },
  };
};
