export const createContext = ({ req, prisma }) => {
    // Extract user information from the request headers (if needed)
    const userId = req.headers.user_id || null;
    const userRole = req.headers.user_role || null;
  
    return {
      prisma,
      userId,
      userRole,
    };
  };
  