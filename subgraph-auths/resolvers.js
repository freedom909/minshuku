import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import AccountLockService from '../infrastructure/auth/accountLockService.js';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Initialize account lock service
const accountLockService = new AccountLockService({
  redisUrl: process.env.REDIS_URL,
  maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
  lockDuration: parseInt(process.env.ACCOUNT_LOCK_DURATION || '900', 10) // 15 minutes in seconds
});

// Debug logger
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

export const resolvers = {
  Mutation: {
    signIn: async (_, { input }, { dataSources }) => {
      logger.info('signIn mutation called with input:', {
        provider: input?.provider,
        hasEmail: !!input?.email,
        hasPassword: !!input?.password,
        hasToken: !!input?.token
      });

      try {
        // Validate input exists
        if (!input) {
          logger.error('No input provided');
          throw new GraphQLError('Input is required', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }

        // Check if account is locked (for email/password auth)
        if (input.email && !input.provider) {
          const isLocked = await accountLockService.isAccountLocked(input.email);
          if (isLocked) {
            const lockDetails = await accountLockService.getLockDetails(input.email);
            logger.info(`Account locked: ${input.email}`, lockDetails);
            
            throw new GraphQLError('Account temporarily locked due to too many failed attempts', {
              extensions: { 
                code: 'ACCOUNT_LOCKED',
                remainingTime: lockDetails.remainingTime
              }
            });
          }
        }

        let authResult;
        
        // OAuth Flow
        if (input.provider) {
          logger.info(`Processing ${input.provider} OAuth login`);
          
          if (!input.token) {
            logger.error('Missing OAuth token');
            throw new GraphQLError('OAuth token required', {
              extensions: { code: 'MISSING_OAUTH_TOKEN' }
            });
          }

          try {
            // Verify Google token
            logger.debug('Verifying Google token');
            const ticket = await googleClient.verifyIdToken({
              idToken: input.token,
              audience: process.env.GOOGLE_CLIENT_ID
            });
            
            const payload = ticket.getPayload();
            logger.debug('OAuth payload received', {
              email: payload.email,
              name: payload.name,
              sub: payload.sub
            });

            // Find or create user
            logger.debug('Finding or creating user');
            const user = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              role: 'USER'
            };

            // Generate token
            logger.debug('Generating JWT token');
            const token = jwt.sign(
              { id: user.id, role: user.role },
              process.env.JWT_SECRET || 'default-secret',
              { expiresIn: '1h' }
            );

            authResult = {
              token,
              userId: user.id,
              role: user.role
            };

            // Clear any existing lock if user authenticates via OAuth
            if (payload.email) {
              await accountLockService.clearLock(payload.email);
            }

            logger.info('OAuth authentication successful', {
              userId: user.id,
              email: user.email
            });
          } catch (oauthError) {
            logger.error('OAuth verification failed', oauthError);
            throw new GraphQLError('OAuth authentication failed', {
              extensions: { code: 'OAUTH_FAILURE', originalError: oauthError.message }
            });
          }
        } 
        // Email/Password Flow
        else {
          logger.info('Processing email/password login');
          
          if (!input.email || !input.password) {
            logger.error('Missing credentials');
            throw new GraphQLError('Email and password required', {
              extensions: { code: 'MISSING_CREDENTIALS' }
            });
          }

          try {
            // Attempt authentication (replace with your actual auth logic)
            const user = await dataSources.userService.authenticate(input.email, input.password);
            
            if (!user) {
              // Record failed attempt and check if account should be locked
              const lockResult = await accountLockService.recordFailedAttempt(input.email);
              logger.info(`Failed login attempt for ${input.email}`, lockResult);
              
              if (lockResult.locked) {
                throw new GraphQLError('Account temporarily locked due to too many failed attempts', {
                  extensions: { 
                    code: 'ACCOUNT_LOCKED',
                    remainingTime: lockResult.remainingTime
                  }
                });
              }
              
              throw new GraphQLError('Invalid email or password', {
                extensions: { 
                  code: 'INVALID_CREDENTIALS',
                  remainingAttempts: lockResult.remainingAttempts
                }
              });
            }

            // Generate token
            const token = jwt.sign(
              { id: user.id, role: user.role },
              process.env.JWT_SECRET || 'default-secret',
              { expiresIn: '1h' }
            );

            authResult = {
              token,
              userId: user.id,
              role: user.role
            };

            // Clear failed attempts on successful login
            await accountLockService.clearLock(input.email);
            
            logger.info('Email/password authentication successful', {
              userId: user.id,
              email: user.email
            });
          } catch (authError) {
            // If it's already a GraphQLError, just rethrow it
            if (authError instanceof GraphQLError) {
              throw authError;
            }
            
            // Otherwise wrap in a GraphQLError
            logger.error('Authentication error', authError);
            throw new GraphQLError('Authentication failed', {
              extensions: { code: 'AUTH_FAILED', originalError: authError.message }
            });
          }
        }

        if (!authResult) {
          logger.error('Authentication failed - no authResult');
          throw new GraphQLError('Authentication failed', {
            extensions: { code: 'AUTH_FAILED' }
          });
        }

        logger.info('Authentication successful', {
          userId: authResult.userId,
          role: authResult.role
        });
        
        return {
          code: 200,
          success: true,
          message: 'Login successful',
          auth: {
            token: authResult.token,
            userId: authResult.userId,
            role: authResult.role
          },
          role: authResult.role,
          userId: authResult.userId
        };

      } catch (error) {
        logger.error('SignIn error', error);
        
        // Handle specific error types
        if (error instanceof GraphQLError) {
          return {
            code: error.extensions?.code === 'ACCOUNT_LOCKED' ? 423 : // Locked
                 error.extensions?.code === 'INVALID_CREDENTIALS' ? 401 : // Unauthorized
                 400, // Bad Request
            success: false,
            message: error.message,
            role: 'GUEST',
            userId: null,
            auth: null
          };
        }
        
        return {
          code: 500,
          success: false,
          message: error.message || 'Authentication failed',
          role: 'GUEST',
          userId: null,
          auth: null
        };
      }
    }
  }
};

export default resolvers;