import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { loginValidate } from '../infrastructure/helpers/loginValidator.js';
import runValidations from '../infrastructure/helpers/runValidations.js';
import validateInviteCode from '../infrastructure/helpers/validateInvitecode.js';

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
        const {
          email,
          password,
          provider,
          idToken,
          accessToken
        } = input;
        const {
          localAuthService,
          oauthService,
        } = dataSources.userService;
    
        let user;
    
        if (provider) {
          console.log(`Attempting OAuth login with provider: ${provider}`);
          const providerToken = idToken || accessToken;
    
          if (!providerToken) {
            throw new GraphQLError('Provider token required', {
              extensions: { 
                code: 'INVALID_INPUT',
                provider 
              }
            });
          }
    
          try {
            console.log(`Validating token for provider: ${provider}`);
            await oauthService.validateProviderToken(provider, providerToken);
          } catch (error) {
            console.error('Token validation error:', error);
            throw new GraphQLError('Failed to validate provider token', {
              extensions: { 
                code: 'INVALID_PROVIDER_TOKEN',
                provider,
                error: error.message 
              }
            });
          }
    
          try {
            console.log(`Getting user info from provider: ${provider}`);
            const providerUserInfo = await oauthService.loginViaProvider(provider, providerToken);
            if (!providerUserInfo) {
              throw new GraphQLError('Failed to get user info from provider', {
                extensions: { 
                  code: 'PROVIDER_USER_INFO_ERROR',
                  provider 
                }
              });
            }
            console.log('Provider user info:', providerUserInfo);
    
            user = await oauthService.loginWithProvider(providerUserInfo);
            console.log('User after login:', user);
          } catch (error) {
            console.error('Provider login error:', error);
            throw new GraphQLError('Failed to login with provider', {
              extensions: { 
                code: 'PROVIDER_LOGIN_ERROR',
                provider,
                error: error.message 
              }
            });
          }
        } else {
          if (!email || !password) {
            throw new GraphQLError('Email and password are required', {
              extensions: { code: 'INVALID_INPUT' }
            });
          }
    
          if (!loginValidate(email, password)) {
            throw new GraphQLError('Invalid email or password', {
              extensions: { code: 'INVALID_LOGIN' }
            });
          }
    
          user = await localAuthService.authenticateUser(email, password);
        }
    
        if (!user || !user._id) {
          console.error('User not found or invalid user object:', user);
          throw new GraphQLError("Authentication failed", {
            extensions: { 
              code: "AUTHENTICATION_ERROR",
              details: "User not found or invalid user data"
            }
          });
        }

        // 验证 JWT_SECRET 是否已正确配置
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret === "default") {
          console.error('JWT_SECRET not properly configured');
          throw new GraphQLError("Server configuration error", {
            extensions: { code: "CONFIGURATION_ERROR" }
          });
        }

        try {
          console.log('Generating JWT token for user:', user._id.toString());
          const token = jwt.sign(
            { 
              id: user._id.toString(),
              role: user.role // 添加角色信息到 token
            },
            jwtSecret,
            { expiresIn: "1h" }
          );

          const response = {
            code: 200,
            success: true,
            message: "Login successful",
            auth: {
              token,
              userId: user._id.toString(),
              role: user.role,
            },
            refreshToken: user.refreshToken,
          };
          console.log('Login successful for user:', user._id.toString());
          return response;
        } catch (jwtError) {
          console.error('JWT generation error:', jwtError);
          throw new GraphQLError("Failed to generate authentication token", {
            extensions: { 
              code: "TOKEN_GENERATION_ERROR",
              error: jwtError.message
            }
          });
        }
      } catch (error) {
        console.error('Error in signIn:', error);
        // 确保错误信息被正确传播
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError(error.message || "Internal server error", {
          extensions: { 
            code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            originalError: error.message
          }
        });
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