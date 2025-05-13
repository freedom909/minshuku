import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { loginValidate } from '../infrastructure/helpers/loginValidator.js';
import runValidations from '../infrastructure/helpers/runValidations.js';
import validateInviteCode from '../infrastructure/helpers/validateInviteCode.js';

dotenv.config();

const resolvers = {
  Query: {
    user: async (_, { id }, { dataSources }) => {
      const { localAuthService } = dataSources.userService;
      const user = await localAuthService.getUserFromDb(id);
      if (!user) throw new GraphQLError("No user found", { extensions: { code: "NO_USER_FOUND" } });
      return user;
    },

    getUserByEmail: async (_, { email }, { dataSources }) => {
      return dataSources.userService.localAuthService.getUserByEmailFromDb(email);
    },

    me: async (_, __, { dataSources, userId }) => {
      if (!userId) {
        throw new GraphQLError("User not authenticated", {
          extensions: { code: "BAD_REQUEST_ERROR" },
        });
      }
      return dataSources.userService.localAuthService.getUserFromDb(userId);
    },
  },

  Mutation: {
    signIn: async (_, { input }, { dataSources }) => {
      try {
        const { email, password, provider, providerToken } = input;
        const { localAuthService, oauthService, tokenService } = dataSources.userService;

        let user;

        if (provider) {
          if (!providerToken) {
            throw new GraphQLError('Provider token required', { extensions: { code: 'INVALID_INPUT' } });
          }

          await oauthService.validateProviderToken(provider, providerToken);

          const providerUserInfo = await oauthService.getUserInfoFromProvider(provider, providerToken);
          if (!providerUserInfo) {
            throw new GraphQLError('Invalid provider token', { extensions: { code: 'INVALID_PROVIDER_TOKEN' } });
          }

          user = await oauthService.loginWithProvider(providerUserInfo);
        } else {
          if (!loginValidate(email, password)) {
            throw new GraphQLError('Invalid email or password', { extensions: { code: 'INVALID_LOGIN' } });
          }

          user = await localAuthService.authenticateUser(email, password);
        }

        if (!user || !user._id) {
          throw new GraphQLError("Incorrect credentials", { extensions: { code: "BAD_USER_INPUT" } });
        }

        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || "default", {
          expiresIn: "1h",
        });

        return {
          code: 200,
          success: true,
          message: "Login successful",
          token,
          userId: user._id.toString(),
          role: user.role,
        };
      } catch (error) {
        console.error('Error in signIn:', error);
        throw error;
      }
    },

    signUp: async (_, { input }, { dataSources }) => {
      const { localAuthService, tokenService } = dataSources.userService;

      await runValidations(input);

      const { email, password, name, nickname, role, inviteCode, picture } = input;

      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new GraphQLError('Invalid invite code', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
      }

      try {
        const newUser = await localAuthService.register({
          email,
          password,
          name,
          nickname,
          role,
          picture,
        });

        const token = await tokenService.generateToken(newUser);

        return {
          userId: newUser._id.toString(),
          token,
          role: newUser.role,
        };
      } catch (error) {
        console.error('Error during signUp:', error);
        throw new GraphQLError('User registration failed', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    logout: async (_, { provider }, { dataSources, session }) => {
      try {
        const { oauthService } = dataSources.userService;

        if (provider) {
          await oauthService.revokeProviderToken(provider);
        }

        if (session) {
          return new Promise((resolve, reject) => {
            session.destroy(err => {
              if (err) {
                reject(new GraphQLError('Session termination failed', {
                  extensions: { code: 'SESSION_ERROR' },
                }));
              } else {
                resolve(true);
              }
            });
          });
        }

        return true;
      } catch (error) {
        console.error('Error during logout:', error);
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

        const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || "default", {
          expiresIn: "30m",
        });

        await localAuthService.sendLinkToUser(user.email, token);

        return {
          code: 200,
          success: true,
          message: "Password reset link sent",
          email: user.email,
        };
      } catch (error) {
        console.error('Error in forgotPassword:', error);
        throw new GraphQLError('Internal Server Error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    updatePassword: async (_, { userId, password, newPassword }, { dataSources }) => {
      if (!userId || !password || !newPassword) {
        throw new GraphQLError("Missing input for password update", {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const { localAuthService } = dataSources.userService;
      try {
        const success = await localAuthService.updatePassword(userId, password, newPassword);
        if (!success) {
          throw new GraphQLError("Password update failed", {
            extensions: { code: 'UPDATE_FAILED' },
          });
        }

        return {
          code: 200,
          success: true,
          message: "Password updated successfully",
        };
      } catch (error) {
        console.error('Error in updatePassword:', error);
        throw new GraphQLError('Internal Server Error', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};

export default resolvers;
