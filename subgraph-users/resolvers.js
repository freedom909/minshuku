import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { loginValidate } from '../infrastructure/helpers/loginValidator.js';
import runValidations from '../infrastructure/helpers/runValidations.js';
import validateInviteCode from '../infrastructure/helpers/validateInviteCode.js';
import TokenService from '../services/userService/tokenService.js';
import LocalAuthService from '../services/userService/localAuthService.js';
import OAuthService from '../services/userService/oauthService.js';
import userRepository from '../services/repositories/userRepository.js';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '1h' });
};

const resolvers = {
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
          extensions: { code: "BAD_REQUEST_ERROR" },
        });
      }
      return await localAuthService.getUserFromDb(userId);
    },
  },

  Mutation: {
    async saveOAuthUser(_, args, { dataSources }) {
      console.log('Received input:', input);
      try {
        const savedUser = await dataSources.userService.saveOAuthUser(args.input);
        return {
          success: true,
          message: 'OAuth user saved successfully',
          user: savedUser,
        };
      } catch (error) {
        console.error('❌ Failed to save OAuth user:', error.message);

        throw new GraphQLError('Unable to save OAuth user', {
          extensions: {
            code: 'SAVE_OAUTH_USER_FAILED',
            originalError: error.message,
          },
        });
      }
    },

    signIn: async (_, { input }, { dataSources }) => {
      try {
        const { localAuthService, oAuthService, tokenService } = dataSources.userService;
        const { email, password, provider, providerToken } = input;
        let user;

        if (provider) {
          if (!providerToken) {
            throw new GraphQLError("Provider token is required for OAuth login", {
              extensions: { code: "INVALID_INPUT" },
            });
          }

          await oAuthService.validateProviderToken(provider, providerToken);
          const providerUserInfo = await oAuthService.getUserInfoFromProvider(provider, providerToken);

          if (!providerUserInfo) {
            throw new GraphQLError("Invalid provider token", {
              extensions: { code: "INVALID_PROVIDER_TOKEN" },
            });
          }

          user = await oAuthService.loginWithProvider(providerUserInfo);
        } else {
          if (!loginValidate(email, password)) {
            throw new GraphQLError("Invalid email or password", {
              extensions: { code: "INVALID_LOGIN" },
            });
          }

          user = await localAuthService.login(email, password);
        }

        if (!user || !user._id) {
          throw new GraphQLError("Incorrect email or password", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'good', { expiresIn: "1h" });

        return {
          code: 200,
          success: true,
          message: "Login successful",
          token,
          userId: user._id.toString(),
          role: user.role,
        };
      } catch (error) {
        console.error("Error in signIn resolver:", error);
        throw error;
      }
    },

    signUp: async (_, { input }, { dataSources }) => {
      const { localAuthService, tokenService } = dataSources.userService;
      const { email, password, name, nickname, role, inviteCode, picture } = input;

      await runValidations(input);

      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new GraphQLError("Invalid invite code", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }
      }

      try {
        const userData = { email, password, name, nickname, role, picture };
        const user = await localAuthService.register(userData);
        const token = await tokenService.generateToken(user);

        return {
          userId: user._id.toString(),
          token,
          role,
        };
      } catch (error) {
        console.error("Error during signUp:", error);
        throw new GraphQLError("User registration failed", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    logout: async (_, { provider }, context) => {
      const { dataSources } = context;
      const { oAuthService } = dataSources.userService;

      try {
        if (provider) {
          await oAuthService.revokeProviderToken(provider, context);
        }

        if (context.session) {
          return new Promise((resolve, reject) => {
            context.session.destroy(err => {
              if (err) {
                reject(new GraphQLError("Failed to terminate the session", {
                  extensions: { code: "FAILED_TO_TERMINATE_SESSION" },
                }));
              }
              resolve(true);
            });
          });
        }

        return true;
      } catch (error) {
        console.error("Error during logout:", error);
        throw error;
      }
    },

    forgotPassword: async (_, { email }, { dataSources }) => {
      try {
        if (!email) {
          throw new GraphQLError("Email is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const { localAuthService } = dataSources.userService;
        const user = await localAuthService.getUserByEmailFromDb(email);

        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const token = generateToken(user);
        await localAuthService.sendLinkToUser(user.email, token);

        return {
          code: 200,
          success: true,
          message: "Password reset link sent successfully",
          email: user.email,
        };
      } catch (error) {
        console.error("Error in forgotPassword resolver:", error);
        throw new GraphQLError("Internal Server Error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updatePassword: async (_, { userId, password, newPassword }, { dataSources }) => {
      try {
        if (!userId || !password || !newPassword) {
          throw new GraphQLError("Missing input fields", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const { localAuthService } = dataSources.userService;
        return await localAuthService.updatePassword(userId, password, newPassword);
      } catch (error) {
        console.error("Error in updatePassword resolver:", error);
        throw new GraphQLError("Failed to update password", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

export default resolvers;
