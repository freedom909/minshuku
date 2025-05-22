//services/usserService/oauthService.js
import axios from "axios";
import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from "graphql";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import UserRepository from "../repositories/userRepository.js";
import dotenv from "dotenv";
dotenv.config();
import pkg from "jsonwebtoken";
const { verify } = pkg;
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

class OAuthService extends RESTDataSource {
  constructor({ tokenService, userRepository }) {
    super();
    if (!tokenService || !userRepository) {
      throw new Error("OAuthService requires tokenService and userRepository");
    }
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  loginWithProvider({ provider, token, refreshToken, oauthId }) {
    switch (provider) {
      case "GOOGLE":
        return this.signInWithGoogle({ token, refreshToken, oauthId });
      case "APPLE":
        return this.signInWithApple({ token, refreshToken, oauthId });
      case "FACEBOOK":
        return this.signInWithFacebook({ token, refreshToken, oauthId });
      default:
        throw new GraphQLError("Unsupported provider", {
          extensions: {
            code: "UNSUPPORTED_PROVIDER",
            provider,
          },
        });
    }
  }

  async authenticate(provider, accessToken) {
    try {
      if (!provider || !accessToken) {
        throw new GraphQLError("Provider and access token are required", {
          extensions: { code: "INVALID_INPUT" },
        });
      }
      let userInfo;
      switch (provider) {
        case "google":
          userInfo = await this.verifyGoogleToken(accessToken);
          break;
        case "facebook":
          userInfo = await this.verifyFacebookToken(accessToken);
          break;
        case "apple":
          userInfo = await this.verifyAppleToken(accessToken);
          break;
        default:
          throw new GraphQLError("Unsupported OAuth provider", {
            extensions: { code: "UNSUPPORTED_PROVIDER" },
          });
      }
      if (!userInfo || !userInfo.email) {
        throw new GraphQLError(
          "Failed to retrieve user info from OAuth provider",
          {
            extensions: { code: "INVALID_OAUTH_TOKEN" },
          }
        );
      }
      let user = await this.userRepository.getUserByEmailFromDb(userInfo.email);
      if (!user) {
        newUser = await this.userRepository.createUser({
          email: userInfo.email,
          name: userInfo.name || "",
          picture: userInfo.picture,
          password: null,
          provider: provider,
          role: "GUEST",
          active: true,
          oauthId: userInfo.id || null,
        });
      }
      user = await this.userRepository.insertUser(newUser);

      // Generate tokens and return
      const token = this.tokenService.generateToken(user);
      const refreshToken = this.tokenService.generateRefreshToken(user);
      return { user, token, refreshToken };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new GraphQLError("Authentication failed", {
        extensions: { code: "AUTHENTICATION_FAILED" },
      });
    }
  }

  async verifyGoogleToken(accessToken) {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  }

  async login(email, password) {
    console.log('Starting local login process for email:', email);

    if (!this.localAuthService) {
      throw new GraphQLError('Local authentication service is not configured', {
        extensions: { code: 'SERVICE_UNAVAILABLE' }
      });
    }
  
    try {
      // 验证输入
      if (!email || !password) {
        throw new GraphQLError('Email and password are required', {
          extensions: { 
            code: 'INVALID_INPUT',
            requiredFields: ['email', 'password']
          }
        });
      }

      // 检查账户是否被锁定
      if (this.accountLockService) {
        const isLocked = await this.accountLockService.isAccountLocked(email);
        if (isLocked) {
          const retryAfter = await this.accountLockService.getLockTimeRemaining(email);
          throw new GraphQLError('Account temporarily locked due to too many failed attempts', {
            extensions: {
              code: 'ACCOUNT_LOCKED',
              retryAfter
            }
          });
        }
      }

      // 尝试登录
      console.log('Attempting local login for email:', email);
      const user = await this.localAuthService.login(email, password);

      // 登录成功后清除失败尝试记录
      if (this.accountLockService) {
        await this.accountLockService.clearAttempts(email);
      }

      if (!user || !user._id) {
        // 记录失败尝试
        if (this.accountLockService) {
          await this.accountLockService.recordAttempt(email);
        }
        
        throw new GraphQLError('Invalid credentials', {
          extensions: { 
            code: 'INVALID_CREDENTIALS',
            attemptsRemaining: this.accountLockService 
              ? this.accountLockService.MAX_ATTEMPTS - await this.accountLockService.getAttemptCount(email)
              : null
          }
        });
      }

      // 生成访问令牌和刷新令牌
      console.log('Generating tokens for user:', user._id.toString());
      const [accessToken, refreshToken] = await Promise.all([
        this.tokenService.generateToken(user),
        this.tokenService.generateRefreshToken(user)
      ]);
  
      console.log('Local login successful for user:', user._id.toString());
      return {
        code: 200,
        success: true,
        message: "Login successful",
        token: accessToken,
        refreshToken,
        userId: user._id?.toString?.() || user.id,
        role: user.role,
        user: {
          id: user._id?.toString?.() || user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          picture: user.picture
        }
      };
    } catch (error) {
      console.error('Local login error:', error);
      
      if (error instanceof GraphQLError) {
        throw error;
      }

      throw new GraphQLError('Authentication failed', {
        extensions: { 
          code: 'AUTHENTICATION_FAILED',
          error: error.message
        }
      });
    }
  }
  

  async oauthLogin(input) { //  'TypeError: userService.oauthLogin is not a function',
    console.log('Starting OAuth login process:', { provider: input.provider });

    if (!this.oauthService) {
      throw new GraphQLError('OAuth service is not configured', {
        extensions: { code: 'SERVICE_UNAVAILABLE' }
      });
    }

    try {
      // 验证输入
      if (!input.provider || !input.token) {
        throw new GraphQLError('Provider and token are required', {
          extensions: { 
            code: 'INVALID_INPUT',
            requiredFields: ['provider', 'token']
          }
        });
      }
     const supportedProviders = ['GOOGLE', 'FACEBOOK', 'APPLE']; // 支持的提供商列表
      if (!supportedProviders.includes(input.provider.toUpperCase())) {
        throw new GraphQLError('Unsupported OAuth provider', {
          extensions: {
            code: 'UNSUPPORTED_PROVIDER',
            supportedProviders
          }
        });
      }
      // 验证提供商token并获取用户信息
      console.log('Authenticating with provider:', input.provider);
      const providerUser = await this.oauthService.authenticate(input.provider, input.token);

      if (!providerUser || !providerUser.email) {
        throw new GraphQLError('Invalid provider response', {
          extensions: { 
            code: 'INVALID_PROVIDER_RESPONSE',
            provider: input.provider
          }
        });
      }

      // 使用提供商信息登录或创建用户
      console.log('Processing provider user:', { 
        email: providerUser.email,
        provider: input.provider 
      });
      const user = await this.oauthService.loginWithProvider(providerUser);

      if (!user || !user._id) {
        throw new GraphQLError('Failed to process user data', {
          extensions: { 
            code: 'USER_PROCESSING_ERROR',
            provider: input.provider
          }
        });
      }

      // 生成访问令牌和刷新令牌
      console.log('Generating tokens for user:', user._id.toString());
      const [accessToken, refreshToken] = await Promise.all([
        this.tokenService.generateToken(user),
        this.tokenService.generateRefreshToken(user)
      ]);

      console.log('OAuth login successful for user:', user._id.toString());
      return {
        code: 200,
        success: true,
        message: "Login successful",
        token: accessToken,
        refreshToken,
        userId: user._id.toString(),
        role: user.role,
        user: {
          id: user._id.toString(),
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          picture: user.picture
        }
      };

    } catch (error) {
      console.error('OAuth login error:', error);
      
      if (error instanceof GraphQLError) {
        throw error;
      }

      throw new GraphQLError('OAuth login failed', {
        extensions: { 
          code: 'OAUTH_LOGIN_FAILED',
          provider: input.provider,
          error: error.message
        }
      });
    }
  }

  async signInWithGoogle({ token, refreshToken, oauthId }) {
    try {
      this.googleClient = googleClient;

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("Google token verified successfully");
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;
      const googleOAuthId = payload.sub;

      const finalOAuthId = oauthId || googleOAuthId;

      let user = await this.userRepository.findByOAuthId(
        "GOOGLE",
        finalOAuthId
      );

      if (!user) {
        user = await this.userRepository.createOAuthUser({
          email,
          name,
          picture,
          oauthId: finalOAuthId,
          provider: "GOOGLE",
          role: "GUEST",
          refreshToken,
        });
      }

      return user;
    } catch (error) {
      throw new GraphQLError("Invalid Google token", {
        extensions: {
          code: "INVALID_GOOGLE_TOKEN",
          provider: "GOOGLE",
          error,
        },
      });
    }
  }

  async signInWithFacebook({ token, refreshToken, oauthId }) {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: token,
          fields: "id,name,email,picture",
        },
      });

      const { id: facebookOAuthId, name, email } = response.data;

      const finalOAuthId = oauthId || facebookOAuthId;

      let user = await this.userRepository.findByOAuthId(
        "FACEBOOK",
        finalOAuthId
      );

      if (!user) {
        user = await this.userRepository.createOAuthUser({
          email,
          name,
          picture: response.data.picture?.data?.url,
          oauthId: finalOAuthId,
          provider: "FACEBOOK",
          role: "GUEST",
          refreshToken,
        });
      }

      return user;
    } catch (error) {
      throw new GraphQLError("Invalid Facebook token", {
        extensions: {
          code: "INVALID_FACEBOOK_TOKEN",
          provider: "FACEBOOK",
          error,
        },
      });
    }
  }
}
export default OAuthService;
