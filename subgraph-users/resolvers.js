import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const resolvers = {
  Mutation: {
    oauthLogin: async (_, { input }, { dataSources }) => {
      try {
        const { provider, token } = input;
        
        if (provider !== 'GOOGLE') {
          throw new GraphQLError('Only Google OAuth is currently supported', {
            extensions: { code: 'UNSUPPORTED_PROVIDER' }
          });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        // Check if user exists
        let user = await dataSources.userService.findByEmail(email);
        
        // Create new user if doesn't exist
        if (!user) {
          user = await dataSources.userService.createUser({
            email,
            name,
            picture,
            oauthProvider: 'GOOGLE',
            oauthId: sub,
            role: 'GUEST' // Default role
          });
        }

        // Generate JWT
        const authPayload = {
          token: dataSources.userService.generateToken(user),
          userId: user.id,
          role: user.role
        };

        return authPayload;
      } catch (error) {
        console.error('OAuth login failed:', error);
        throw new GraphQLError('OAuth authentication failed', {
          extensions: { 
            code: 'OAUTH_FAILED',
            error: error.message 
          }
        });
      }
    }
  }
};

export default resolvers;