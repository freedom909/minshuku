import { GraphQLError } from 'graphql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
import { loginValidate, passwordValidate } from '../infrastructure/helpers/loginValidator.js';
import runValidations from '../infrastructure/helpers/runValidations.js';
import validateInviteCode from '../infrastructure/helpers/validateInviteCode.js';
import TokenService from '../services/userService/tokenService.js';
import LocalAuthService from '../services/userService/localAuthService.js';
import OAuthService from '../services/userService/oauthService.js';

// Config and external dependencies
dotenv.config();

// Utility function for error handling
const resolvers = {
  Mutation: {
    Query: {
      user: async (_, { id }, { dataSources }) => {
        const { localAuthService } = dataSources.userService;
        const user = await localAuthService.getUserFromDb(id);
        if (!user) {
          throw new GraphQLError("No user found", {
            extensions: { code: "NO_USER_FOUND" },
          });
        }
        return user;
      },
      getUserByEmail: async (_, { email }, { dataSources }) => {
        const { localAuthService } = dataSources.userService;
        return localAuthService.getUserByEmailFromDb(email);
      },
      me: async (_, __, { dataSources, userId }) => {
        const { localAuthService } = dataSources.userService;
        if (!userId) {
          throw new GraphQLError("User not authenticated", {
            extensions: { code: ApolloServerErrorCode.BAD_REQUEST_ERROR },
          });
        }
        const user = await localAuthService.getUserFromDb(userId);
        return user;
      },
    },


    signIn: async (_, { input }, { dataSources }) => {

      try {
        //console.log('Resolver context:', context); // Debugging context

        if (!dataSources || !dataSources.userService) {
          throw new GraphQLError('UserService is not defined in dataSources', {
            extensions: { code: 'SERVICE_UNAVAILABLE' },
          });
        }

        const { localAuthService, oAuthService, tokenService } = dataSources.userService;
        if (!localAuthService || !oAuthService || !tokenService) {
          throw new GraphQLError('Authentication services are missing', {
            extensions: { code: 'SERVICE_UNAVAILABLE' },
          });
        }

        const { email, password, provider, providerToken } = input;
        let user;

        if (provider) {
          if (!providerToken) {
            throw new GraphQLError('Provider token is required for OAuth login', {
              extensions: { code: 'INVALID_INPUT' },
            });
          }

          // Validate provider token (Ensure validateProviderToken is implemented)
          await oAuthService.validateProviderToken(provider, providerToken);

          let providerUserInfo;
          try {
            providerUserInfo = await oAuthService.getUserInfoFromProvider(provider, providerToken);
          } catch (error) {
            console.error("Error fetching provider user info: ${error.message}", error);
            throw new GraphQLError('Failed to fetch user info from provider', {
              extensions: { code: 'PROVIDER_ERROR' },
            });
          }

          if (!providerUserInfo) {
            throw new GraphQLError('Invalid provider token', {
              extensions: { code: 'INVALID_PROVIDER_TOKEN' },
            });
          }

          // Login with the provider user info
          user = await oAuthService.loginWithProvider(providerUserInfo);
        } else {
          // Email/password login validation (Ensure loginValidate is implemented)
          if (!loginValidate(email, password)) {
            throw new GraphQLError('Invalid email or password', {
              extensions: { code: 'INVALID_LOGIN' },
            });
          }

          user = await localAuthService.login({ email, password });
        }

        if (!user) {
          throw new AuthenticationError('Invalid credentials');
        }

        // Generate and return JWT token
        return {
          userId: user._id.toString(), // Ensure it's a string
          token: tokenService.generateToken({
            _id: user._id.toString(),
            email: user.email,
            role: user.role
          }),
          role: user.role,
        };
      } catch (error) {
        console.error('Error in signIn resolver:', error);
        throw error; // Re-throw the error to be handled by Apollo Server
      }
    },

    signUp: async (_, { input }, { dataSources }) => {
      console.log("🛠️ signUp called with input:", input);
      if (!dataSources || !dataSources.userService) {
        throw new Error('dataSources.userService is not defined');
      }

      const { localAuthService, tokenService } = dataSources.userService;
      if (!localAuthService || !tokenService) {
        throw new Error('Required authentication services are missing');
      }
      // Proceed with the sign-up logic
      const { email, password, name, nickname, role, inviteCode, picture } = input;

      // Run validations
      await runValidations(input);

      // Additional role validation
      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new GraphQLError('Invalid invite code', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      try {
        const userData = {
          email,
          password,
          name,
          nickname,
          role,
          picture,
        }
        const user = await localAuthService.register(userData);
        const token = await tokenService.generateToken(user);
        const response = await localAuthService.register(input);

        console.log("🚀 Sign-up response:", response);
        return response;
      } catch (error) {
        console.error('Error during signUp:', error);
        throw new GraphQLError('User registration failed', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    signUp: async (_, { input }, { dataSources }) => {
      console.log("🛠️ signUp called with input:", input);
      if (!dataSources || !dataSources.userService) {
        throw new Error('dataSources.userService is not defined');
      }

      const { localAuthService, tokenService } = dataSources.userService;
      if (!localAuthService || !tokenService) {
        throw new Error('Required authentication services are missing');
      }
      // Proceed with the sign-up logic
      const { email, password, name, nickname, role, inviteCode, picture } = input;

      // Run validations
      await runValidations(input);

      // Additional role validation
      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new GraphQLError('Invalid invite code', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      try {
        const userData = {
          email,
          password,
          name,
          nickname,
          role,
          picture,
        }

        const user = await localAuthService.register(userData);
        const token = await tokenService.generateToken(user);
        const response = { userId: user._id.toString(), token: token, role: role }


        return response;
      } catch (error) {
        console.error('Error during signUp:', error);
        throw new GraphQLError('User registration failed', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },



    logout: async (_, { provider }, context) => {
      const { dataSources } = context;
      const { oAuthService } = dataSources.userService;
      try {
        console.log('Logging out user...');
        // 1️⃣ Logout from OAuth provider (if applicable)
        if (provider) {
          await oAuthService.revokeProviderToken(provider, context);
        }
        // 2️⃣ Destroy session (if applicable)
        if (context.session) {
          return new Promise((resolve, reject) => {
            context.session.destroy(err => {
              if (err) {
                reject(new GraphQLError('Failed to terminate the session', {
                  extensions: { code: 'FAILED_TO_TERMINATE_SESSION' }
                }));
              }
              resolve(true);
            });
          });
        }

        return true;
      } catch (error) {
        console.error('Error during logout:', error);
        throw error; // Re-throw the error to be handled by Apollo Server
      }
    },



    forgotPassword: async (_, { email }, { dataSources }) => {
      try {
        console.log('Received email:', email); // Debugging line
        //  await loginValidate(email);
        const { localAuthService } = dataSources.userService;
        // Validate the email input
        if (!email) {
          throw new GraphQLError("Email is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        // Retrieve the user by email from the database
        const user = await localAuthService.getUserByEmailFromDb(email);
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
        // Generate a reset password token
        const token = generateToken(user);
        console.log('Generated token:', token); // Debugging line
        await localAuthService.sendLinkToUser(user.email, token);
        console.log('Email sent to user:', user.email); // Debugging line
        // Return the token and user info
        const response = {
          code: 200,
          success: true,
          message: "Password reset link sent successfully",
          email: user.email,
        }
        console.log('Response:', response); // Debugging line
        return response;
      } catch (error) {
        console.error('Error in forgotPassword resolver:', error);
        throw new GraphQLError('Internal Server Error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    updatePassword: async (_, { userId, password, newPassword }, { dataSources }) => {
      //retrieve the user from the db
      if (!userId) {
        return new GraphQLError("User ID is required", { extensions: { code: "USER_ID_REQUIRED" } });
      }
      const { localAuthService } = dataSources.userService;
      const user = await userService.findById(userId);// "message": "User not found",
      console.log('User retrieved from DB:', user);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      //validate the password

      await passwordValidate(newPassword);//"Password must contain at least 8 characters and include a number",
      await passwordValidate(password);
      // validate the is matching
      const passwordMatch = bcrypt.compareSync(password, user.password);
      console.log('Password match result:', passwordMatch);
      if (!passwordMatch) {
        throw new GraphQLError("Invalid password", {
          extensions: { code: "INVALID_PASSWORD" },
        });
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      const updatedUser = await localAuthService.editPassword(userId, hashedNewPassword);
      console.log('User after password update:', updatedUser);
      return updatedUser;
    },

    generateInviteCode: async (_, { }, { dataSources, userId }) => {
      if (!userId) {
        throw new GraphQLError("Please login to send invite code", {
          extensions: {
            code:
              "USER_ID_REQUIRED"
          }
        });
      }
      const user = await getUserById(id)
      // Ensure that only hosts can generate invite codes
      if (user.role !== 'HOST') {
        throw new GraphQLError("Only hosts can generate invite codes", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const { localAuthService } = dataSources.userService;
      const inviteCode = await localAuthService.generateInviteCode(email, user);
      return { inviteCode };
    },

    sendInviteCode: async (_, { email }, { dataSources, userId }) => {
      if (!userId) {
        throw new GraphQLError("Please login to send invite code", {
          extensions: {
            code:
              "USER_ID_REQUIRED"
          }
        });
      }
      const user = await getUserById(id)
      if (user.role !== 'HOST') {
        throw new GraphQLError("Only hosts can send invite codes", {
          extensions: { code: "FORBIDDEN" },
        });
      }
      const { localAuthService } = dataSources.userService;
      const inviteCode = await localAuthService.generateInviteCode(email);
      await localAuthService.sendInviteCode(email, inviteCode)
      return { success: true };
    },

    requestResetPassword: async (_, { email }, { dataSources }) => {
      const { localAuthService } = dataSources.userService;
      // Validate the email input (optional step)
      if (!email) {
        throw new GraphQLError("Email is required", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      // Retrieve the user by email from the database
      const user = await localAuthService.getUserByEmailFromDb(email);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const token = await localAuthService.createResetPasswordToken(user.id);
      await sendResetPasswordEmail(user.email, token);
      return {
        code: 200,
        success: true,
        message: "Password reset link sent successfully",
      };
    },

    thirdPartyLogin: async (_, { input }, context) => {
      try {
        console.log('Resolver context:', context); // Debugging context
        const { dataSources } = context;

        // Validate dataSources and services
        if (!dataSources?.userService) {
          throw new GraphQLError('UserService is not defined in dataSources', {
            extensions: { code: 'SERVICE_UNAVAILABLE' },
          });
        }

        const { oAuthService, tokenService } = dataSources.userService;
        if (!oAuthService || !tokenService) {
          throw new GraphQLError('Required authentication services are missing', {
            extensions: { code: 'SERVICE_UNAVAILABLE' },
          });
        }

        // Validate the input
        const { provider, providerToken } = input;
        if (!provider || !providerToken) {
          throw new GraphQLError("Invalid third-party login input", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        // Validate the provider token
        const userInfo = await oAuthService.validateProviderToken(provider, providerToken);
        if (!userInfo) {
          throw new AuthenticationError("Invalid credentials");
        }

        // Generate a JWT for the authenticated user
        const jwtToken = await tokenService.generateToken(userInfo); // Ensure this method is correctly implemented

        return {
          token: jwtToken,
          success: true,
        };
      } catch (error) {
        console.error('Error in thirdPartyLogin resolver:', error);

        // Rethrow GraphQL-specific errors directly
        if (error instanceof GraphQLError || error instanceof AuthenticationError) {
          throw error;
        }

        // Wrap and throw unexpected errors
        throw new GraphQLError('An unexpected error occurred', {
          extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error },
        });
      }
    }
  },
  _Entity: {
    __resolveType(entity) {
      if (entity.__typename === 'Host') {
        return 'Host';
      }
      if (entity.__typename === 'Guest') {
        return 'Guest';
      }
      return null; // GraphQLError is thrown
    },
  },

  User: {
    __resolveType(user) {
      if (user.role === "HOST") {
        return "Host";
      } else if (user.role === "GUEST") {
        return "Guest";
      }
      return null;
    },
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.userService.getUserFromDb(user.id);
    },
  },
  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.userService.getUserFromDb(user.id);
    },
  }
}


export default resolvers;