//services/DB/initUserContainer.js
import { createContainer, asClass, asValue } from 'awilix';
import UserRepository from '../repositories/userRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import OAuthService from '../userService/oauthService.js';
import TokenService from '../userService/tokenService.js';
import initMongoContainer from '../DB/initMongoContainer.js';

const validateEnvironment = () => {
  const requiredVars = [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (process.env.JWT_SECRET === 'default_secret' || process.env.JWT_SECRET === 'default') {
    throw new Error('JWT_SECRET must be properly configured with a secure value');
  }
};

const initUserContainer = async () => {
  try {
    // 验证环境变量
    validateEnvironment();

    const mongodb = await initMongoContainer();
    if (!mongodb) {
      throw new Error('Failed to initialize MongoDB connection');
    }

    const container = createContainer();

    // 注册服务和依赖
    container.register({
      mongodb: asValue(mongodb),
      userRepository: asClass(UserRepository).singleton(),
      localAuthService: asClass(LocalAuthService).singleton(),
      oauthService: asClass(OAuthService).singleton(),
      tokenService: asClass(TokenService).singleton(),
      
      // 环境变量配置
      expiresIn: asValue(process.env.JWT_EXPIRES_IN || '1h'),
      secretKey: asValue(process.env.JWT_SECRET),
      
      // OAuth配置
      googleClientId: asValue(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: asValue(process.env.GOOGLE_CLIENT_SECRET),
      googleRedirectUri: asValue(process.env.GOOGLE_REDIRECT_URI),
    });

    console.log('User container initialized successfully');
    return container;
  } catch (error) {
    console.error('Failed to initialize user container:', error);
    throw error;
  }
};

export default initUserContainer;