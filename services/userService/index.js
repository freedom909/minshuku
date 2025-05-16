//services/userService/index.js
import { GraphQLError } from 'graphql';

class UserService {
  constructor({ localAuthService = null, oauthService = null, tokenService }) {
    this.localAuthService = localAuthService;
    this.oauthService = oauthService;
    this.tokenService = tokenService;
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

      // 尝试登录
      console.log('Attempting local login for email:', email);
      const user = await this.localAuthService.login(email, password);

      if (!user || !user._id) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' }
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
  

  async oauthLogin(input) {
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
}

export default UserService;