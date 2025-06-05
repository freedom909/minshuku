//services/DB/initUserContainer.js
import { createContainer, asClass, asValue, asFunction } from 'awilix';
import UserRepository from '../repositories/userRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import OAuthService from '../userService/oauthService.js';
import TokenService from '../userService/tokenService.js';
import initMongoContainer from '../DB/initMongoContainer.js';
import UserService from '../userService/index.js';
import logger from '../../infrastructure/utils/logger.js'
import AccountLockService from '../userService/accountLockService.js';
import initRedisClient from './initRedisClient.js';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config();

/**
 * 验证环境变量是否配置正确
 */
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
    const redisClient = await initRedisClient();
    console.log('Redis client initialized:', typeof redisClient.get);// should be 'function'
    // 注册服务和依赖
    container.register({
      redisClient: asValue(redisClient),
      mongodb: asValue(mongodb),
      logger: asValue(logger),
      userRepository: asClass(UserRepository).singleton(),
      accountLockService: asFunction(
        ({ redisClient, maxAttempts, lockDuration, namespace }) =>
          new AccountLockService({ redisClient, maxAttempts, lockDuration, namespace })
      ).singleton(),      
      maxAttempts: asValue(parseInt(process.env.MAX_ATTEMPTS || '50')),
      recordAttempts: asValue(parseInt(process.env.RECORD_ATTEMPTS || '10')),
      lockDuration: asValue(parseInt(process.env.LOCK_DURATION || '900')),
      namespace: asValue(process.env.REDIS_NAMESPACE || 'auth'),
      localAuthService: asClass(LocalAuthService).singleton(),
      tokenService: asClass(TokenService).singleton(),
      oauthService: asClass(OAuthService).singleton(),
      passwordHasher: asValue({
        compare: bcrypt.compare,
        hash: bcrypt.hash
      }),
      userService: asClass(UserService).singleton(),
      bcrypt: asValue(bcrypt),
      
      // 环境变量配置
      expiresIn: asValue(process.env.JWT_EXPIRES_IN || '1h'),
      secretKey: asValue(process.env.JWT_SECRET),
      
      // OAuth配置
      googleClientId: asValue(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: asValue(process.env.GOOGLE_CLIENT_SECRET),
      googleRedirectUri: asValue(process.env.GOOGLE_REDIRECT_URI),
      facebookClientId: asValue(process.env.FACEBOOK_CLIENT_ID),
      facebookClientSecret: asValue(process.env.FACEBOOK_CLIENT_SECRET),
      facebookRedirectUri: asValue(process.env.FACEBOOK_REDIRECT_URI),
      githubId: asValue(process.env.GITHUB_ID),
      githubSecret: asValue(process.env.GITHUB_SECRET),
    });

    console.log('User container initialized successfully');
    return container;
  } catch (error) {
    console.error('Failed to initialize user container:', error);
    throw error;
  }
};

export default initUserContainer;