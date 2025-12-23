import { OAuth2Client } from 'google-auth-library';
import UserRepository from '../../services/repositories/userRepository.js'; // Adjust path
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();

async function handleGoogleOAuth(token) {
    const userData = await verifyGoogleToken(token);
    if (!userData || !userData.email || !userData.id) {
      throw new Error('Invalid user data from token');
    }
  
    // Upsert using provider + sub logic
    const user = await userRepository.upsertUser(userData);
    return user;
  }
const userRepository = new UserRepository({ mongodb: null });
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      email: payload.email,
      name:
        payload.name ||
        payload.fullName ||
        `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
      picture: payload.picture,
      id: payload.sub, // <-- Google "sub" (unique user ID)
      provider: 'GOOGLE',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new GraphQLError('Invalid Google token', {
      extensions: {
        code: 'INVALID_GOOGLE_TOKEN',
        provider: 'GOOGLE',
        error,
      },
    });
  }
}



export default handleGoogleOAuth;
