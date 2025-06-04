import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import validateHostInviteCode from "../infrastructure/helpers/validateHostInviteCode.js";
import  loginValidate  from "../infrastructure/helpers/loginValidator.js";
import applyRateLimiting from "../infrastructure/middleware/rateLimitStore.js";

import handleSignUpError from "../infrastructure/utils/handleSignUpError.js";
import userService from "../services/userService/index.js";
import registerValidate from "../infrastructure/helpers/registerValidator.js";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Debug logger
const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || "");
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data || "");
  },
};

export const resolvers = {
  Mutation: {
    signIn: async (_, { input }, { container }) => {

      const logger = container.resolve("logger");
      const accountLockService = container.resolve("accountLockService");

      // const userService = container.resolve("userService");
      console.log("SIGN-IN INPUT:", input); // no output in the terminal

      let { provider, token, email, password, idToken, accessToken } = input;
      // Normalize token regardless of provider
       token = token || idToken || accessToken;

      logger.info("signIn mutation called with input:", {
        provider: provider,
        email: email,
        password: password,
        token: token,
        idToken: idToken,
        accessToken: accessToken,
      });
    
      const isOAuth = !!provider && !!token;
      const isLocal = !!email && !!password;
    
      if (!isOAuth && !isLocal) {
        throw new GraphQLError(
          "Invalid sign-in input: must provide either email/password or provider/token",
          {
            extensions: {
              code: "INVALID_INPUT",
            },
          }
        );
      }
    
      // Only check account lock for local auth
      if (isLocal) {
        const isLocked = await accountLockService.isAccountLocked(email);
        if (isLocked) {
          const lockDetails = await accountLockService.getLockDetails(email);
          logger.info(`Account locked: ${email}`, lockDetails);
    
          throw new GraphQLError(
            "Account temporarily locked due to too many failed attempts",
            {
              extensions: {
                code: "ACCOUNT_LOCKED",
                remainingTime: lockDetails.remainingTime,
              },
            }
          );
        }
      }
    
      let response;
      const userService = container.resolve('userService');
      try {
        response = isOAuth
          ? await userService.oauthLogin(provider, token)
          : await userService.localLogin(email, password);
      } catch (err) {
        logger.error("Login error:", err);
    
        // Handle failed attempt for local login
        if (isLocal) {
          const lockResult = await accountLockService.recordFailedAttempt(email);
          logger.info(`Failed login attempt for ${email}`, lockResult);
    
          if (lockResult.locked) {
            throw new GraphQLError(
              "Account temporarily locked due to too many failed attempts",
              {
                extensions: {
                  code: "ACCOUNT_LOCKED",
                  remainingTime: lockResult.remainingTime,
                },
              }
            );
          }
    
          throw new GraphQLError("Invalid email or password", {
            extensions: {
              code: "INVALID_CREDENTIALS",
              remainingAttempts: lockResult.remainingAttempts,
            },
          });
        }
    
        // OAuth-specific error
        throw new GraphQLError("OAuth authentication failed", {
          extensions: { code: "OAUTH_FAILED" },
        });
      }
    
      const user = response.user;
      if (!user) {
        logger.error("Authentication failed - no user returned");
        throw new GraphQLError("Authentication failed", {
          extensions: { code: "AUTH_FAILED" },
        });
      }
    
      // On successful login, clear account lock
      if (isLocal) {
        await accountLockService.clearLock(email);
      }
    
      logger.info("Authentication successful", {
        userId: user.id,
        role: user.role,
      });
    
      return {
        code: response.code,
        success: response.success,
        message: response.message,
        auth: {
          token: response.token,
          userId: response.userId,
          role: response.role,
        },
        refreshToken: response.refreshToken,
        role: response.role,
        userId: response.userId,
      };
    },   
    
   
    logout: async (_, { input }, { container, req, logger, user }) => {
      try {
        const { provider, token } = input;
        const userService = container.resolve("userService");
    
        // Revoke token if applicable
        await userService.tokenService.revokeProviderToken(provider, token);
    
        // Destroy session if it exists
        if (req.session) {
          await new Promise((resolve, reject) => {
            req.session.destroy(err => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
    
        logger.info("Logout successful", { userId: user?.id, role: user?.role });
    
        return { success: true, message: "Logout successful" };
      } catch (error) {
        logger.error("Error during logout", { error: error.message });
    
        throw new GraphQLError("Logout failed", {
          extensions: {
            code: "LOGOUT_FAILED",
            error: error.message,
          },
        });
      }
    },

    validateOAuthToken: async (_, { provider, token }) => {
      console.log(
        `[validateOAuthToken] Provider: ${provider}, Token: ${token}`
      );

      // Fake validation (replace with actual logic)
      if (!provider || !token) {
        throw new Error("Invalid provider or token");
      }

      // Simulate a success/failure case
      if (provider === "GOOGLE" && token === "test-token") {
        return true;
      }
      throw new GraphQLError("Invalid token", {
        extensions: { code: "INVALID_TOKEN" },
      });
    },
   
    signUp: async (_, { input }, { container, req }) => {
      const { email, password, name, nickname, role, inviteCode, picture } = input;
    
      try {
        
        const userRepository  = container.resolve("userRepository");
       const userService  = container.resolve("userService");
        const { localAuthService, tokenService } = userService;
    
        // Apply rate limiting
        await applyRateLimiting(req);
        // await loginValidate(email, password);
        // await registerValidate(name, nickname, picture, role);
    
        if (role === "HOST") {
          await validateHostInviteCode(inviteCode);
        }
    
        const existingUser = await userRepository.getUserByEmailFromDb(email);
        if (existingUser) {
          throw new GraphQLError("Email already registered", {
            extensions: { code: "DUPLICATE_EMAIL" },
          });
        }
    
        const registrationResult = await localAuthService.register(
          email, password, name, nickname, role, picture
        );
        const user = registrationResult.user;
        if (!user || !user.id) {
          throw new GraphQLError("Registration failed: Missing user ID");
        }
        console.log(`✅ Registered new user: ${email} (${user.id})`);
  
        return {
          code: 200,
          success: true,
          message: "Registration successful",
          userId: user.id,
          auth: {
            token: user.auth.token,
            refreshToken: user.auth.refreshToken,
          },
          role: user.role,
        };
      } catch (error) {
        return handleSignUpError(error);
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

        const user = await userRepository.getUserByEmailFromDb(email);

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

    oauthSaveUser: async (_, { input }, { dataSources }) => {   
      const { provider, token } = input;
      const { oauthService } = dataSources.userService;
      try {
        const user = await oauthService.saveUser(provider, token);
        return {
          code: 200,
          success: true,
          message: "User saved successfully",
          user: user,
        };
      } catch (error) {
        console.error("Error in oauthSaveUser:", error);
        throw new GraphQLError("Internal Server Error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
 
    verifyGoogleToken: async (_, { token }, { dataSources }) => {
      return dataSources.oauthService.verifyGoogleToken(token);
    },

    verifyFacebookToken: async (_, { token }, { dataSources }) => {
      return dataSources.oauthService.verifyFacebookToken(token);
    },
    verifyTwitterToken: async (_, { token }, { dataSources }) => {
      return dataSources.oauthService.verifyTwitterToken(token);
    },
    verifyGithubToken: async (_, { token }, { dataSources }) => {
      return dataSources.oauthService.verifyGithubToken(token);
    },
   verifyAppleToken: async (_, { token }, { dataSources }) => {
      return dataSources.oauthService.verifyAppleToken(token);
    },
  },
};

export default resolvers;