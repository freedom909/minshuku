import pkg from 'mongodb';
const { MongoClient } = pkg;
import { createContainer, asClass, asValue } from 'awilix';
import MyNumberCardService from '../accountServices/myNumberCard.service.js';
import OcrService from '../accountServices/ocr/ocrService.js';
import StorageService from '../accountServices/storage/storageService.js';
import connectToMongoDB from './connectMongoDB.js';
import AccountService from '../accountServices/accountService.js';
import AccountRepository from '../repositories/accountRepository.js';
import UserService from '../userService/index.js';
import UserRepository from '../repositories/userRepository.js';
import connectMysql from './connectMysqlDB.js';
import connectNeo4j from './connectNeo4jDB.js';
import ListingRepository from '../repositories/listingRepository.js';
import ListingService from '../listingService.js';
import CartRepository from '../repositories/cartRepository.js';
import CartService from '../cartService.js';
import BookingService from '../bookingService.js';
import BookingRepository from '../repositories/bookingRepository.js';
import PaymentService from '../paymentService.js';
import PaymentRepository from '../repositories/paymentRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import TokenService from '../userService/tokenService.js';
import AccountLockService from '../userService/accountLockService.js';
import OAuthService from '../userService/oauthService.js';
import passwordHasher from '../../infrastructure/helpers/passwordHasher.js';
import logger from '../../infrastructure/utils/logger.js';
import redisClient from '../redisClient.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '../../.env' });

const initAccountContainer = async ({ services = [] } = {}) => {
  let mongodb;
  let mysqldb;
  let neo4jdb;

  try {
    // Establish connection to MongoDB database
    mongodb = await connectToMongoDB();
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Error connecting to MongoDB database:', error);
    throw error;
  }

  try {
    mysqldb = await connectMysql();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    throw error;
  }

  try {
    neo4jdb = await connectNeo4j();
    console.log('Connected to Neo4j database');
  } catch (error) {
    console.error('Error connecting to Neo4j database:', error);
    throw error;
  }

  // Create a container and register services and repositories
  const container = createContainer();
  container.register({
    mongodb: asValue(mongodb),
    mysqldb: asValue(mysqldb),
    neo4jdb: asValue(neo4jdb),
    
    // Infrastructure
    passwordHasher: asValue(passwordHasher),
    logger: asValue(logger),
    
    // JWT Configuration
    secretKey: asValue(process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string'),
    expiresIn: asValue(process.env.JWT_EXPIRY || '1d'),
    options: asValue({ algorithm: process.env.JWT_ALGORITHM || 'HS256' }),
    
    // Redis Configuration
    redisClient: asValue(redisClient),
    maxAttempts: asValue(parseInt(process.env.MAX_ATTEMPTS || '5')),
    lockDuration: asValue(parseInt(process.env.LOCK_DURATION || '900000')), // 15 minutes in milliseconds
    namespace: asValue('auth:lockout:'),
    
    // Repositories
    userRepository: asClass(UserRepository).singleton(),
    accountRepository: asClass(AccountRepository).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
    cartRepository: asClass(CartRepository).singleton(),
    bookingRepository: asClass(BookingRepository).singleton(),
    paymentRepository: asClass(PaymentRepository).singleton(),
    
    // Services
    tokenService: asClass(TokenService).singleton(),
    accountLockService: asClass(AccountLockService).singleton(),
    localAuthService: asClass(LocalAuthService).singleton(),
    oauthService: asClass(OAuthService).singleton(),
    userService: asClass(UserService).singleton(),
    accountService: asClass(AccountService).singleton(),
    userRepository: asClass(UserRepository).singleton(),
    myNumberCardService: asClass(MyNumberCardService).singleton(),
    ocrService: asClass(OcrService).singleton(),
    storageService: asClass(StorageService).singleton(),
    listingService: asClass(ListingService).singleton(),
    cartService: asClass(CartService).singleton(),
    bookingService: asClass(BookingService).singleton(),
    paymentService: asClass(PaymentService).singleton(),
  });
  return container;
};

export default initAccountContainer;
