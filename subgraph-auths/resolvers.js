import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

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
      const logger = container.resolve("logger");// Assuming you have a logger service registered in the container?
      const accountLockService = container.resolve("accountLockService");

      const userService = container.resolve("userService");
    
      const { provider, token, email, password } = input;
    
      // logger.info("signIn mutation called with input:", {
      //   provider: provider,
      //   email: email,
      //   password: password,
      //   token: token,
      // });
    
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
      try {
        response = isOAuth
          ? await userService.oauthLogin(provider, token)
          : await userService.login(email, password);
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
    
      const user = response.user; // "Cannot read properties of undefined (reading 'user')",
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
  },
};

export default resolvers;
