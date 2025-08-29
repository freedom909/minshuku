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

// 👇 import your OAuth provider classes
import { GoogleOAuth, FacebookOAuth, GithubOAuth } from '../userService/providers/index.js';

config();

const validateEnvironment = () => {
const requiredVars = [
  'JWT_SECRET',   

  // Google
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',

  // Facebook
  'FACEBOOK_CLIENT_ID',
  'FACEBOOK_CLIENT_SECRET',
  'FACEBOOK_REDIRECT_URI',

  // Github
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_REDIRECT_URI',

  // Apple
  // 'APPLE_CLIENT_ID',
  // 'APPLE_CLIENT_SECRET',
  // 'APPLE_REDIRECT_URI',
];


  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default') {
  console.warn('⚠️ JWT_SECRET is not secure. Using default for testing only.');
  process.env.JWT_SECRET = 'dev_secret_key_123';
}

};

const initUserContainer = async () => {
  try {
    validateEnvironment();

    const mongodb = await initMongoContainer();
    if (!mongodb) {
      throw new Error('Failed to initialize MongoDB connection');
    }

    const container = createContainer();
    const redisClient = await initRedisClient();

    container.register({
      redisClient: asValue(redisClient),
      mongodb: asValue(mongodb),
      logger: asValue(logger),
      userRepository: asClass(UserRepository).singleton(),
      accountLockService: asFunction(
        ({ redisClient, maxAttempts, lockDuration, namespace }) =>
          new AccountLockService({ redisClient, maxAttempts, lockDuration, namespace })
      ).singleton(),      
      maxAttempts: asValue(parseInt(process.env.MAX_ATTEMPTS || '500')),
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
      
      // JWT config
      expiresIn: asValue(process.env.JWT_EXPIRES_IN || '1h'),
      secretKey: asValue(process.env.JWT_SECRET),
      options: asValue({ expiresIn: process.env.options || 'HS256' }),

      // OAuth provider instances (must use `new` here)
      googleOAuth: asFunction(() => 
        new GoogleOAuth({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          redirectUri: process.env.GOOGLE_REDIRECT_URI
        })
      ).singleton(),

      
      facebookOAuth: asFunction(() => 
        new FacebookOAuth({
          clientId: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          redirectUri: process.env.FACEBOOK_REDIRECT_URI
        })
      ).singleton(),
      // appleOAuth: asFunction(() => 
      //   new AppleOAuth({
      //     clientId: process.env.APPLE_CLIENT_ID,
      //     clientSecret: process.env.APPLE_CLIENT_SECRET,
      //     redirectUri: process.env.APPLE_REDIRECT_URI
      //   })
      // ).singleton(),
      githubOAuth: asFunction(() => 
        new GithubOAuth({
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          redirectUri: process.env.GITHUB_REDIRECT_URI
        })
      ).singleton(),
    });
    container.register({
      userRepository: asClass(UserRepository).singleton(),
    });

    console.log('User container initialized successfully');
    return container;
  } catch (error) {
    console.error('Failed to initialize user container:', error);
    throw error;
  }
};

export default initUserContainer;
