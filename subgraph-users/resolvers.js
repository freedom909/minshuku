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
        const existingUser = await userRepository.getUserByEmailFromDb(email);
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
        const existingUser = await userRepository.getUserByEmailFromDb(email);
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
    }
  },
};

export default resolvers;