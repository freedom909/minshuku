const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory user store (replace with database in production)
const users = {};

// Verify Google OAuth token
async function verifyGoogleToken(token) {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        return {
            email: payload.email,
            name: payload.name,
            profilePicture: payload.picture,
            googleId: payload.sub
        };
    } catch (error) {
        console.error('Google token verification failed:', error);
        return null;
    }
}

// Generate JWT token
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// Find or create user from OAuth data
async function findOrCreateUser(oauthData, provider) {
    // In a real app, you would query your database here
    
    // For demo purposes, we'll use the email as a unique identifier
    let user = Object.values(users).find(u => u.email === oauthData.email);
    
    if (!user) {
        // Create new user
        const id = `user_${Date.now()}`;
        user = {
            id,
            email: oauthData.email,
            name: oauthData.name,
            profilePicture: oauthData.profilePicture,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            [provider + 'Id']: oauthData[provider + 'Id']
        };
        
        // Save user (in a real app, this would be a database operation)
        users[id] = user;
    } else {
        // Update existing user with new OAuth info
        user[provider + 'Id'] = oauthData[provider + 'Id'];
        user.updatedAt = new Date().toISOString();
        
        // Update user in store
        users[user.id] = user;
    }
    
    return user;
}

// Resolvers
const resolvers = {
    Query: {
        ping: () => 'pong',
        
        me: (_, __, { user }) => {
            if (!user) return null;
            return users[user.id];
        },
        
        user: (_, { id }, { user }) => {
            // Check if requester is admin
            if (!user || user.role !== 'admin') {
                throw new ForbiddenError('Not authorized');
            }
            
            return users[id];
        }
    },
    
    Mutation: {
        signIn: async (_, { input }) => {
            const { provider, token } = input;
            
            try {
                let oauthData;
                
                // Verify token based on provider
                switch (provider.toLowerCase()) {
                    case 'google':
                        oauthData = await verifyGoogleToken(token);
                        break;
                    // Add other providers here
                    default:
                        throw new Error(`Unsupported provider: ${provider}`);
                }
                
                if (!oauthData) {
                    return {
                        success: false,
                        error: 'Invalid authentication token'
                    };
                }
                
                // Find or create user
                const user = await findOrCreateUser(oauthData, provider.toLowerCase());
                
                // Generate JWT
                const jwtToken = generateToken(user);
                
                return {
                    success: true,
                    token: jwtToken,
                    user
                };
            } catch (error) {
                console.error('Sign in error:', error);
                return {
                    success: false,
                    error: error.message || 'Authentication failed'
                };
            }
        },
        
        signOut: (_, __, { user }) => {
            // In a stateless JWT system, client-side token removal is sufficient
            // This resolver is mainly for future extensions (like token blacklisting)
            return true;
        }
    }
};

module.exports = resolvers;