// authService.js
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';

// Initialize Google OAuth client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
});

export const checkPassword = async (plainPassword, hashedPassword) => {
  if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
    throw new TypeError('Arguments must be of type string');
  }
  return await bcrypt.compare(plainPassword, hashedPassword);
};

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async verifyGoogleToken(token) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        providerId: payload.sub
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new GraphQLError('Invalid Google token', {
        extensions: { code: 'INVALID_OAUTH_TOKEN' }
      });
    }
  }

  async handleOAuthUser(profile) {
    try {
      // Check if user exists
      let user = await this.userRepository.findOne({ 
        email: profile.email 
      });

      // Create new user if doesn't exist
      if (!user) {
        user = await this.userRepository.create({
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          oauthProvider: 'google',
          oauthId: profile.providerId,
          role: 'GUEST' // Default role
        });
      }

      // Generate JWT
      return this.generateUserToken(user);
    } catch (error) {
      console.error('OAuth user handling failed:', error);
      throw error;
    }
  }

  generateUserToken(user) {
    const payload = { 
      id: user._id.toString(),
      role: user.role 
    };
    return {
      token: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }),
      userId: user._id.toString(),
      role: user.role
    };
  }

  async login({ email, password, googleToken }) {
    // Handle Google OAuth login
    if (googleToken) {
      const profile = await this.verifyGoogleToken(googleToken);
      return this.handleOAuthUser(profile);
    }

    // Regular email/password login
    try {
      // Find the user by email
      const existingUser = await this.userRepository.findOne({ email });
      console.log("existingUser:", existingUser);

      // Check if the user exists
      if (!existingUser) {
        throw new GraphQLError('User does not exist', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Check if the password matches
      const passwordMatch = await checkPassword(password, existingUser.password);
      if (!passwordMatch) {
        throw new GraphQLError('Incorrect password', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Generate JWT token
      const payload = { id: existingUser._id.toString() };
      const role = existingUser.role;
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Ensure all fields are valid before returning
      if (existingUser._id && role && token) {
        console.log("token:", token);
        console.log("userId:", existingUser._id.toString());
        console.log("role:", role);
        return { token, userId: existingUser._id.toString(), role };
      } else {
        throw new GraphQLError('Incomplete data', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
    } catch (e) {
      console.error('Error during login:', e);

      // Handle specific error codes
      if (e.code === 11000) {
        throw new GraphQLError("Email can't be found", {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      // Re-throw the error if it's not specifically handled
      throw new GraphQLError('Login failed', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  }
}

export default AuthService;