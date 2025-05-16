//services/usserService/oauthService.js
import axios from "axios";
import { RESTDataSource } from "@apollo/datasource-rest";
import dotenv from "dotenv";
import { GraphQLError } from "graphql";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
//import { loginValidate } from '../infrastructure/helpers/loginValidator.js';
//import runValidations from '../../infrastructure/helpers/runValidations.js';
//import validateInviteCode from '../infrastructure/helpers/validateInviteCode.js';

//import UserRepository from '../repositories/userRepository';
dotenv.config();

import jwksClient from "jwks-rsa";

function getAppleKey(header, callback) {
  const appleClient = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
  });
  appleClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PROVIDERS = {
  GOOGLE: {
    decode: async (token) => {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
      } catch (error) {
        throw new Error("Invalid Google token");
      }
    },
    validateUrl: (token) =>
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
    validateCheck: (data) => data.aud === process.env.GOOGLE_CLIENT_ID,
    revokeUrl: (token) =>
      `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
    userInfo: {
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
      needsAuthHeader: true,
    },
  },
  FACEBOOK: {
    decode: async (token) => {
      const { data } = await axios.get("https://graph.facebook.com/me", {
        params: { fields: "id,name,email,picture", access_token: token },
      });
      return data;
    },
    validateUrl: (token) =>
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`,
    validateCheck: (data) => data.data?.is_valid,
    revokeUrl: (token) =>
      `https://graph.facebook.com/me/permissions?access_token=${token}`,
    userInfo: {
      url: (token) =>
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`,
      needsAuthHeader: false,
    },
  },
  APPLE: {
    decode: async (token) => {
      /* TODO: implement Apple decode */
    },
    validateUrl: (token) =>
      `https://appleid.apple.com/auth/tokeninfo?id_token=${token}`,
    validateCheck: (data) => data.aud === process.env.APPLE_CLIENT_ID,
    revokeUrl: (token) => `https://appleid.apple.com/auth/revoke`,
    userInfo: {
      url: "https://appleid.apple.com/auth/userinfo",
      needsAuthHeader: true,
    },
  },
};

class OAuthService extends RESTDataSource {
  constructor({ tokenService, userRepository }) {
    super();
    if (!tokenService || !userRepository) {
      throw new Error("OAuthService requires tokenService and userRepository");
    }
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  normalizeProvider(provider) {
    if (!provider) {
      throw new GraphQLError("Provider is required", {
        extensions: { code: "INVALID_PROVIDER" }
      });
    }

    try {
      const normalizedProvider = provider.toUpperCase();
      if (!['GOOGLE', 'FACEBOOK', 'APPLE'].includes(normalizedProvider)) {
        throw new GraphQLError(`Unsupported provider: ${provider}`, {
          extensions: { code: "UNSUPPORTED_PROVIDER" }
        });
      }
      return normalizedProvider;
    } catch (error) {
      throw new GraphQLError(`Invalid provider format: ${provider}`, {
        extensions: { 
          code: "INVALID_PROVIDER_FORMAT",
          error: error.message
        }
      });
    }
  }

  getProviderConfig(provider) {
    const config = PROVIDERS[this.normalizeProvider(provider)];
    if (!config) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }
    return config;
  }

  async authenticate(provider, token) {
    if (!provider || !token) throw new Error("Missing provider or token");
    try {
      const userInfo = await this.verifyOAuthToken(provider, token);
      const user = await this.saveOAuthUser({
        provider,
        token,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      });
      return user;
    } catch (error) {
      throw new Error("Invalid OAuth token");
    }
  }

  async verifyOAuthToken(provider, token) {
    const config = this.getProviderConfig(provider);
    return config.decode(token);
  }

  async saveOAuthUser({
    provider,
    oauthId,
    email,
    fullName,
    picture,
    role = "GUEST",
  }) {
    console.log("saveOAuthUser called with:", { provider, oauthId, email, fullName, picture, role });
    
    if (!email || !fullName || !oauthId) {
      throw new Error("Missing required fields: email, fullName, or oauthId");
    }

    try {
      // 检查用户是否已存在
      const existingUser = await this.userRepository.getUserByEmailFromDb(email);
      if (existingUser) {
        console.log("User already exists, returning existing user");
        return existingUser;
      }

      // 创建新用户
      const userData = {
        email: email.toLowerCase(),
        fullName,
        picture,
        authProvider: provider || 'OAUTH',
        [`${(provider || 'oauth').toLowerCase()}Id`]: oauthId,
        role,
        isEmailVerified: true, // OAuth用户的邮箱通常已经过验证
        createdAt: new Date(),
        lastLogin: new Date(),
        status: 'ACTIVE'
      };

      console.log("Creating new user with data:", { ...userData, picture: picture ? '[HAS_PICTURE]' : '[NO_PICTURE]' });
      
      const newUser = await this.userRepository.insertUser(userData);
      
      if (!newUser || !newUser._id) {
        throw new Error("Failed to create user in database");
      }
      
      console.log("New user created successfully with ID:", newUser._id.toString());
      return newUser;
    } catch (error) {
      console.error("Error in saveOAuthUser:", error);
      throw new GraphQLError("Failed to create or retrieve user account", {
        extensions: { 
          code: "USER_CREATION_ERROR",
          provider,
          error: error.message
        }
      });
    }
  }

  async getUserInfoFromProvider(provider, accessToken) {
    const config = this.getProviderConfig(provider);
    console.log("getUserInfoFromProvider config:", config);
  
    if (!config.userInfo?.url) {
      throw new Error("No user info URL provided for this provider.");
    }
  
    const url = typeof config.userInfo.url === "function"
      ? config.userInfo.url(accessToken)
      : config.userInfo.url;

    // 修复：使用定义的headers变量，而不是覆盖它
    const headers = config.userInfo.needsAuthHeader
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
  
    try {
      const { data } = await axios.get(url, { headers });
      console.log("getUserInfo:", data);
      return data;
    } catch (err) {
      console.error("Error fetching user info:", err?.response?.data || err.message);
      throw new Error(`Failed to retrieve user information: ${err?.response?.data ? JSON.stringify(err.response.data) : err.message}`);
    }
  }
  

  async validateProviderToken(provider, token) {
    if (!token) {
      throw new Error("No token provided for provider validation");
    }
    switch (provider.toLowerCase()) {
      case "google":
        return this.validateGoogleToken(token);
      case "facebook":
        return this.validateFacebookToken(token);
      case "apple":
        return this.validateAppleToken(token);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async loginViaProvider(provider, token) {
    console.log("loginViaProvider starting", { provider, tokenLength: token?.length });
    const { userRepository } = this;
    
    try {
      // 1. 规范化 provider 名称
      const normalizedProvider = this.normalizeProvider(provider);
      console.log("Normalized provider:", normalizedProvider);

      // 2. 验证 token
      console.log("Starting token validation");
      let userInfo;

      switch (normalizedProvider) {
        case 'GOOGLE':
          try {
            const ticket = await googleClient.verifyIdToken({
              idToken: token,
              audience: process.env.GOOGLE_CLIENT_ID,
            });
            userInfo = ticket.getPayload();
            console.log("Google token verified successfully");
          } catch (error) {
            console.error("Google token verification failed:", error);
            throw new GraphQLError("Invalid Google token", {
              extensions: { 
                code: "INVALID_TOKEN",
                provider: "GOOGLE",
                error: error.message 
              }
            });
          }
          break;

        case 'FACEBOOK':
          try {
            const isValid = await this.validateFacebookToken(token);
            if (!isValid) {
              throw new Error("Invalid Facebook token");
            }
            userInfo = await this.getUserInfoFromProvider('FACEBOOK', token);
            console.log("Facebook token verified successfully");
          } catch (error) {
            console.error("Facebook token verification failed:", error);
            throw new GraphQLError("Invalid Facebook token", {
              extensions: { 
                code: "INVALID_TOKEN",
                provider: "FACEBOOK",
                error: error.message 
              }
            });
          }
          break;

        default:
          throw new GraphQLError(`Unsupported provider: ${provider}`, {
            extensions: { code: "UNSUPPORTED_PROVIDER" }
          });
      }

      // 3. 验证用户信息
      if (!userInfo?.email) {
        console.error("Invalid user info received:", userInfo);
        throw new GraphQLError("Provider did not return valid user info", {
          extensions: { 
            code: "INVALID_USER_INFO",
            provider: normalizedProvider
          }
        });
      }

      console.log("User info retrieved successfully");
    
      if (!userInfo?.email) {
        throw new GraphQLError("Provider did not return valid user info", {
          extensions: { code: "PROVIDER_USERINFO_ERROR" },
        });
      }

      // 4. 查找或创建用户
      try {
        console.log("Looking up user by email:", userInfo.email);
        let user = await this.userRepository.getUserByEmailFromDb(userInfo.email);

        if (user) {
          console.log("Existing user found");
          // 更新用户的OAuth信息
          user = await this.userRepository.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            picture: userInfo.picture?.data?.url || userInfo.picture || user.picture,
            [`${normalizedProvider.toLowerCase()}Id`]: userInfo.sub || userInfo.id,
          });
        } else {
          console.log("Creating new user");
          // 创建新用户
          user = await this.saveOAuthUser({
            provider: normalizedProvider,
            oauthId: userInfo.sub || userInfo.id,
            email: userInfo.email,
            fullName: userInfo.name,
            picture: userInfo.picture?.data?.url || userInfo.picture,
            role: "GUEST",
          });
        }

        if (!user || !user._id) {
          throw new Error("Failed to create or update user");
        }

        console.log("User processed successfully");
        return user;

      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw new GraphQLError("Failed to process user data", {
          extensions: { 
            code: "DATABASE_ERROR",
            provider: normalizedProvider,
            error: dbError.message
          }
        });
      }

    } catch (error) {
      console.error("Error during provider login:", error);
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError("Failed to login via provider", {
        extensions: { 
          code: "PROVIDER_LOGIN_FAILED",
          provider: provider?.toUpperCase(),
          error: error.message
        }
      });
    }
  }

  async validateGoogleToken(idToken) {
    console.log("validateGoogleToken:", idToken);
    try {
      const { data } = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
      );
      console.log("data:", data); //no output, I didn't get any data from the api, do you find the data?
      if (!data || !data.aud) return false;
      console.log("data.aud:", data.aud);
      console.log("env.CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
      // Verify audience to ensure it matches your Google client ID for web applicatio
      const expectedAud = process.env.GOOGLE_CLIENT_ID;
      

      if (data.aud !== expectedAud) {
        console.warn("Invalid audience:", data.aud);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Google token validation failed:", err.message);
      return false;
    }
  }

  async validateFacebookToken(token) {
    try {
      const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
      const { data } = await axios.get(url);

      const tokenInfo = data.data;

      if (!tokenInfo || !tokenInfo.is_valid) return false;

      if (tokenInfo.app_id !== process.env.FB_APP_ID) {
        console.warn(
          "Facebook token not issued for this app:",
          tokenInfo.app_id
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error("Facebook token validation error:", err.message);
      return false;
    }
  }

  async verifyAppleToken(idToken) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        idToken,
        getAppleKey,
        {
          algorithms: ["RS256"],
          audience: process.env.APPLE_CLIENT_ID,
          issuer: "https://appleid.apple.com",
        },
        (err, decoded) => {
          if (err) {
            console.warn("Apple token verification failed:", err.message);
            return resolve(false);
          }
          resolve(true);
        }
      );
    });
  }

  // Inside your oauthService class
  async validateAppleToken(idToken) {
    return await verifyAppleToken(idToken);
  }

  async revokeProviderToken(provider, context) {
    const config = this.getProviderConfig(provider);
    const { token } = context;
    if (!token) return;

    try {
      await axios.post(config.revokeUrl(token));
    } catch (error) {
      throw new GraphQLError(`Failed to revoke ${provider} token`, {
        extensions: { code: "TOKEN_REVOCATION_FAILED" },
      });
    }
  }

  async loginWithProvider(providerUserInfo) {
    console.log("loginWithProvider called with:", { 
      email: providerUserInfo.email,
      provider: providerUserInfo.provider,
      hasName: !!providerUserInfo.name,
      hasPicture: !!providerUserInfo.picture
    });

    if (!providerUserInfo.email) {
      throw new GraphQLError("Email is required for provider login", {
        extensions: { code: "INVALID_PROVIDER_DATA" }
      });
    }

    try {
      // 查找或创建用户
      let user = await this.userRepository.getUserByEmailFromDb(providerUserInfo.email);

      if (user) {
        console.log("Updating existing user:", user._id.toString());
        
        // 准备更新数据
        const updateData = {
          lastLogin: new Date(),
          isEmailVerified: true
        };
        
        // 可选更新字段
        if (providerUserInfo.picture) {
          updateData.picture = providerUserInfo.picture?.data?.url || providerUserInfo.picture;
        }
        
        if (providerUserInfo.provider && providerUserInfo.oauthId) {
          updateData[`${providerUserInfo.provider.toLowerCase()}Id`] = providerUserInfo.oauthId;
        }

        // 使用 findByIdAndUpdate 替代 updateUser
        user = await this.userRepository.findByIdAndUpdate(
          user._id,
          updateData
        );
      } else {
        console.log("Creating new user for provider:", providerUserInfo.provider);
        // 创建新用户
        user = await this.saveOAuthUser({
          provider: providerUserInfo.provider,
          oauthId: providerUserInfo.oauthId,
          email: providerUserInfo.email,
          fullName: providerUserInfo.name || 'Anonymous',
          picture: providerUserInfo.picture?.data?.url || providerUserInfo.picture,
          role: "GUEST"
        });
      }

      if (!user || !user._id) {
        throw new Error("Failed to process user data");
      }

      console.log("Provider login successful for user:", user._id.toString());
      return user;

    } catch (error) {
      console.error("Provider login error:", error);
      throw new GraphQLError("Failed to process provider login", {
        extensions: { 
          code: "PROVIDER_LOGIN_ERROR",
          provider: providerUserInfo.provider,
          error: error.message
        }
      });
    }
  }
}

export default OAuthService;