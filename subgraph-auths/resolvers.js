import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import authLimiter from '../infrastructure/middleware/authLimiter.js'


import dotenv from "dotenv";
dotenv.config();

import { loginValidate } from "../infrastructure/helpers/loginValidator.js";
import runValidations from "../infrastructure/helpers/runValidations.js";
import validateInviteCode from "../infrastructure/helpers/validateInvitecode.js";

// Simple logger
const logger = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  error: (msg, err) => console.error(`[ERROR] ${msg}`, err),
  debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data || ''),
};


// Ensure secret is set
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default') {
  throw new Error('JWT_SECRET is not properly configured');
}

const resolvers = {
  Query: {
    user: async (_, { id }, { container }) => {
      try {
        if (!id) {
          throw new GraphQLError("User ID is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const user = await container.resolve('userRepository').getUserById(id); 

        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: {
              code: "NOT_FOUND",
              id,
            },
          });
        }

        return user;
      } catch (error) {
        console.error("Error in user query:", error);
        throw error;
      }
    },

    users: async (_, __, { container }) => {
      try {
        const userRepository = container.resolve('userRepository');

        return await userRepository.getAllUsers();
      } catch (error) {
        console.error("Error in users query:", error);
        throw new GraphQLError("Failed to fetch users", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    getUserByEmail: async (_, { email }, { container }) => {
      try {
        if (!email) {
          throw new GraphQLError("Email is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        const userRepository = container.resolve('userRepository');
        const user =
          await userRepository.getUserByEmailFromDb(
            email
          );
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        return user;
      } catch (error) {
        console.error("Error in getUserByEmail:", error);
        throw error;
      }
    },

    me: async (_, __, { container, userId }) => {
      try {
        if (!userId) {
          throw new GraphQLError("Authentication required", {
            extensions: {
              code: "UNAUTHORIZED",
              message: "Please login to access this resource",
            },
          });
        }

        const user = await container.resolve('userRepository').getUserById(userId); ;

        if (!user) {
          throw new GraphQLError("User session invalid", {
            extensions: { code: "INVALID_SESSION" },
          });
        }

        return user;
      } catch (error) {
        console.error("Error in me query:", error);
        throw error;
      }
    },
  },
  Mutation: {
    createUser: async (_, { name, email }, { container}) => {
      try {
        if (!name || !email) {
          throw new GraphQLError("Name and email are required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
 const userRepository = container.resolve('userRepository');
        const existingUser = await userRepository.getUserByEmailFromDb(email);
        if (existingUser) {
          throw new GraphQLError("User with this email already exists", {
            extensions: { code: "CONFLICT" },
          });
        }
      
        const newUser = await localAuthService.createUser({ name, email });

        return newUser;
      } catch (error) {
        console.error("Error in createUser:", error);
        throw new GraphQLError("Failed to create user", {
          extensions: {
            code: "CREATE_FAILED",
            error: error.message,
          },
        });
      }
    },

    updateUser: async (_, { id}, { container}) => {
      try {
        
        if (!id) {
          throw new GraphQLError("User ID is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const userRepository = container.resolve('userRepository');
        const updatedUser = await userRepository.updateUser(id, { name });

        if (!updatedUser) {
          throw new GraphQLError("User not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return updatedUser;
      } catch (error) {
        console.error("Error in updateUser:", error);
        throw new GraphQLError("Failed to update user", {
          extensions: {
            code: "UPDATE_FAILED",
            error: error.message,
          },
        });
      }
    },
    signIn: async (_, { input }, { dataSources, req }) => {
      logger.info('signIn mutation called', {
        provider: input?.provider,
        hasEmail: !!input?.email,
        hasPassword: !!input?.password,
        hasToken: !!input?.token,
      });

      try {
        // Rate limiting
        const ip = req.ip;
        await new Promise((resolve, reject) => {
          const fakeRes = {
            setHeader: () => {},
            status: () => fakeRes,
            send: () => {},
          };
          authLimiter(req, fakeRes, (err) =>
            err ? reject({ error: err, ip }) : resolve()
          );
        });
      } catch (rateLimitError) {
        throw new GraphQLError(
          rateLimitError.error?.message || 'Too many requests',
          {
            extensions: {
              code: 'TOO_MANY_REQUESTS',
              ip: rateLimitError.ip || req.ip,
            },
          }
        );
      }

      if (!input) {
        throw new GraphQLError('Input is required', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { email, password, provider, idToken, accessToken } = input;
      const { localAuthService, oauthService } = dataSources.userService;
      let user;

      if (provider) {
        logger.info(`OAuth login via ${provider}`);
        const token = idToken || accessToken;

        if (!token) {
          throw new GraphQLError('Provider token required', {
            extensions: { code: 'INVALID_INPUT', provider },
          });
        }

        try {
          logger.debug(`Validating token for provider ${provider}`, { token });

          await oauthService.validateProviderToken(provider, token);
          const providerUserInfo = await oauthService.loginViaProvider(provider, token);

          if (!providerUserInfo) {
            throw new GraphQLError('Failed to get user info from provider', {
              extensions: { code: 'PROVIDER_USER_INFO_ERROR', provider },
            });
          }

          user = await oauthService.loginWithProvider(providerUserInfo);
        } catch (error) {
          logger.error('OAuth error', error);
          throw new GraphQLError('OAuth authentication failed', {
            extensions: {
              code: 'PROVIDER_AUTH_ERROR',
              provider,
              error: error.message,
            },
          });
        }
      } else {
        logger.info('Local login attempt');

        if (!email || !password) {
          throw new GraphQLError('Email and password are required', {
            extensions: { code: 'INVALID_INPUT' },
          });
        }

        if (!loginValidate(email, password)) {
          throw new GraphQLError('Invalid email or password', {
            extensions: { code: 'INVALID_LOGIN' },
          });
        }

        user = await localAuthService.authenticateUser(email, password);
      }

      if (!user || !user._id) {
        throw new GraphQLError('Authentication failed', {
          extensions: {
            code: 'AUTHENTICATION_ERROR',
            details: 'User not found or invalid user data',
          },
        });
      }

      try {
        const jwtSecret = process.env.JWT_SECRET;
        const token = jwt.sign(
          { id: user._id.toString(), role: user.role },
          jwtSecret,
          { expiresIn: '1h' }
        );
        const refreshToken = jwt.sign(
          { id: user._id.toString() },
          jwtSecret,
          { expiresIn: '7d' }
        );

        user.refreshToken = refreshToken;
        await user.save();

        logger.info('Authentication successful', { userId: user._id });

        return {
          code: 200,
          success: true,
          message: 'Login successful',
          auth: {
            token,
            userId: user._id.toString(),
            role: user.role,
          },
          refreshToken,
          role: user.role,
          userId: user._id.toString(),
        };
      } catch (jwtError) {
        logger.error('JWT generation failed', jwtError);
        throw new GraphQLError('Failed to generate authentication token', {
          extensions: {
            code: 'TOKEN_GENERATION_ERROR',
            error: jwtError.message,
          },
        });
      }
    },
    signUp: async (_, { input }, { dataSources, req }) => {
      // Apply rate limiting
      try {
        await new Promise((resolve, reject) => {
          authLimiter(req, {}, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (rateLimitError) {
        throw new GraphQLError(rateLimitError.message, {
          extensions: { code: "TOO_MANY_REQUESTS" },
        });
      }

      try {
        const { localAuthService, tokenService } = dataSources.userService;

        // Validate input
        await runValidations(input);
        const { email, password, name, nickname, role, inviteCode, picture } =
          input;

        // Additional validation for HOST role
        if (role === "HOST") {
          if (!inviteCode) {
            throw new GraphQLError("Invite code is required for HOST role", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          const isValidInviteCode = await validateInviteCode(inviteCode);
          if (!isValidInviteCode) {
            throw new GraphQLError("Invalid invite code", {
              extensions: {
                code: "INVALID_INVITE_CODE",
                inviteCode,
              },
            });
          }
        }

        // Check if user already exists
        const existingUser = await localAuthService.getUserByEmailFromDb(email);
        if (existingUser) {
          throw new GraphQLError("Email already registered", {
            extensions: { code: "DUPLICATE_EMAIL" },
          });
        }

        // Create new user
        const newUser = await localAuthService.register({
          email,
          password,
          name,
          nickname,
          role,
          picture,
        });

        // Generate token
        const token = await tokenService.generateToken(newUser);

        // Log successful registration
        console.log(`New user registered: ${email} (${newUser._id})`);

        return {
          userId: newUser._id.toString(),
          token,
          role: newUser.role,
        };
      } catch (error) {
        console.error("Error during signUp:", error);

        // Handle duplicate email error specifically
        if (
          error.message.includes("duplicate") &&
          error.message.includes("email")
        ) {
          throw new GraphQLError("Email already registered", {
            extensions: { code: "DUPLICATE_EMAIL" },
          });
        }

        // Re-throw GraphQLError as is
        if (error instanceof GraphQLError) {
          throw error;
        }

        throw new GraphQLError("Registration failed: " + error.message, {
          extensions: {
            code: "REGISTRATION_FAILED",
            error: error.message,
          },
        });
      }
    },

    logout: async (_, { provider }, { dataSources, session, userId }) => {
      try {
        console.log(
          `Logout requested for user ${userId} (provider: ${
            provider || "none"
          })`
        );

        const { oauthService, sessionService } = dataSources.userService;

        // Revoke provider token if specified
        if (provider) {
          try {
            await oauthService.revokeProviderToken(provider);
            console.log(`Successfully revoked ${provider} token`);
          } catch (revokeError) {
            console.error(`Failed to revoke ${provider} token:`, revokeError);
            // Continue with logout even if provider token revocation fails
          }
        }

        // Destroy session if exists
        if (session) {
          return new Promise((resolve, reject) => {
            session.destroy(async (err) => {
              if (err) {
                console.error("Session destruction error:", err);
                reject(
                  new GraphQLError("Failed to destroy session", {
                    extensions: {
                      code: "SESSION_ERROR",
                      error: err.message,
                    },
                  })
                );
              } else {
                try {
                  // Clean up any expired sessions
                  if (sessionService && sessionService.cleanExpiredSessions) {
                    await sessionService.cleanExpiredSessions(userId);
                  }
                  console.log(
                    `Session destroyed and cleaned for user ${userId}`
                  );
                  resolve(true);
                } catch (cleanError) {
                  console.error("Session cleanup error:", cleanError);
                  resolve(true); // Still resolve as logout succeeded
                }
              }
            });
          });
        }

        return true;
      } catch (error) {
        console.error("Error during logout:", error);
        throw new GraphQLError("Logout failed", {
          extensions: {
            code: "LOGOUT_FAILED",
            error: error.message,
          },
        });
      }
    },

    forgotPassword: async (_, { email }, { dataSources, req }) => {
      // Apply rate limiting
      try {
        await new Promise((resolve, reject) => {
          authLimiter(req, {}, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } catch (rateLimitError) {
        throw new GraphQLError(rateLimitError.message, {
          extensions: { code: "TOO_MANY_REQUESTS" },
        });
      }

      try {
        if (!email) {
          throw new GraphQLError("Email is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const { localAuthService, accountLockService } =
          dataSources.userService;

        // Check if account is temporarily locked
        if (
          accountLockService &&
          (await accountLockService.isAccountLocked(email))
        ) {
          throw new GraphQLError(
            "Account temporarily locked due to too many attempts",
            {
              extensions: {
                code: "ACCOUNT_LOCKED",
                retryAfter: await accountLockService.getLockTimeRemaining(
                  email
                ),
              },
            }
          );
        }

        const user = await localAuthService.getUserByEmailFromDb(email);

        if (!user) {
          // Don't reveal whether email exists for security
          console.log(
            `Password reset requested for non-existent email: ${email}`
          );
          return {
            code: 200,
            success: true,
            message:
              "If an account exists, a password reset link has been sent",
            email: email,
          };
        }

        // Track password reset attempt
        if (accountLockService) {
          await accountLockService.recordAttempt(email);
        }

        // Generate secure reset token
        const resetToken = jwt.sign(
          {
            id: user._id.toString(),
            purpose: "password_reset",
          },
          process.env.JWT_SECRET,
          { expiresIn: "30m" }
        );

        // Send reset email
        await localAuthService.sendPasswordResetEmail(user.email, resetToken);

        console.log(`Password reset email sent to: ${email}`);

        return {
          code: 200,
          success: true,
          message: "Password reset link sent",
          email: user.email,
        };
      } catch (error) {
        console.error("Error in forgotPassword:", error);

        // Handle account locked error specifically
        if (error.extensions?.code === "ACCOUNT_LOCKED") {
          throw error;
        }

        throw new GraphQLError("Failed to process password reset", {
          extensions: {
            code: "RESET_FAILED",
            error: error.message,
          },
        });
      }
    },

    updatePassword: async (
      _,
      { userId, password, newPassword },
      { dataSources }
    ) => {
      if (!userId || !password || !newPassword) {
        throw new GraphQLError("Missing input for password update", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const { localAuthService } = dataSources.userService;
      try {
        const success = await localAuthService.updatePassword(
          userId,
          password,
          newPassword
        );
        if (!success) {
          throw new GraphQLError("Password update failed", {
            extensions: { code: "UPDATE_FAILED" },
          });
        }

        return {
          code: 200,
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        console.error("Error in updatePassword:", error);
        throw new GraphQLError("Internal Server Error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

export default resolvers;
