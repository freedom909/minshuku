import pkg from 'jsonwebtoken';
const { verify } = pkg;

// Secret key for verifying tokens (replace this with your actual secret)
const JWT_SECRET = process.env.JWT_SECRET || 'good';

// Function to get user from JWT token
const getUserFromToken = (token) => {
  try {
    if (token) {
      return verify(token, JWT_SECRET); // Verify the token using the secret key
      console.log('user: ' + JSON.stringify(token)); // Return the user object
    }
    return null;
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export default getUserFromToken;
