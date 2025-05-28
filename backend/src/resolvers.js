const jwt = require('jsonwebtoken');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');

// In-memory user store (replace with database in production)
const users = {};

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
async function findOrCreateUser(oauthInput) {
    const { provider, email, name, picture, providerId } = oauthInput;
    
    // In a real app, you would query your database here
    
    // For demo purposes, we'll use the email as a unique identifier
    let user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
        // Create new user
        const id = `user_${Date.now()}`;
        user = {
            id,
            email,
            name: name || '',
            profilePicture: picture || '',
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            [provider + 'Id']: providerId
        };
        
        // Save user (in a real app, this would be a database operation)
        users[id] = user;
        console.log(`Created new user: ${id} with email: ${email}`);
    } else {
        // Update existing user with new OAuth info
        user.name = name || user.name;
        user.profilePicture = picture || user.profilePicture;
        user[provider + 'Id'] = providerId;
        user.updatedAt = new Date().toISOString();
        
        // Update user in store
        users[user.id] = user;
        console.log(`Updated existing user: ${user.id} with email: ${email}`);
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
            const { provider } = input;
            
            try {
                // Validate required fields
                if (!input.email) {
                    throw new Error('Email is required');
                }
                
                // Currently only supporting Google
                if (provider.toLowerCase() !== 'google') {
                    throw new Error(`Unsupported provider: ${provider}`);
                }
                
                // Find or create user using the OAuth data
                const user = await findOrCreateUser(input);
                
                // Generate JWT
                const jwtToken = generateToken(user);
                
                console.log(`Successfully signed in user: ${user.id} with email: ${user.email}`);
                
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