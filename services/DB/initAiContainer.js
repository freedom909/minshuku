// infrastructure/container/initializeAiContainer.js
import dotenv from "dotenv";
dotenv.config();

import { createContainer, asValue, asClass } from "awilix";

// DB connectors
import connectMysql from "./connectMysqlDB.js";
import connectToMongoDB from "./connectMongoDB.js";
import sequelize from "../models/config/seq.js";

// Repositories
import PaymentRepository from "../repositories/paymentRepository.js";
import ListingRepository from "../repositories/listingRepository.js";
import UserRepository from "../repositories/userRepository.js";
import LocationRepository from "../repositories/locationRepository.js";
import BookingRepository from "../repositories/bookingRepository.js";
import AiRepository from "../repositories/aiRepository.js";

// Services
// import MachineAPI from "../machineAPI.js";
import ListingService from "../listingService.js";
import UserService from "../userService/index.js";
import LocalAuthService from "../userService/localAuthService.js";
import OAuthService from "../userService/oauthService.js";
import TokenService from "../userService/tokenService.js";
import AccountLockService from "../userService/accountLockService.js";
import LocationService from "../locationService.js";
import BookingService from "../bookingService.js";
import PaymentService from "../paymentService.js";
import AiService from "../aiService.js";
import CartService from "../cartService.js";
// Infrastructure
import redisClient from "../redisClient.js";
import logger from "../../infrastructure/utils/logger.js";
import passwordHasher from "../../infrastructure/helpers/passwordHasher.js";
import CartRepository from "../repositories/cartRepository.js";

const initializeAiContainer = async ({ services = [] } = {}) => {
  // Connect DBs
  const mysqldb = await connectMysql();
  const mongodb = await connectToMongoDB();

  const container = createContainer();

  // Config values from .env (with safe defaults)
  const jwtSecret = process.env.JWT_SECRET || "minshuku_jwt_secret_key_2024_secure_random_string";
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
  const jwtAlgorithm = process.env.JWT_ALGORITHM || "HS256";

  const maxAttempts = parseInt(process.env.MAX_ATTEMPTS || "5", 10);
  const lockDuration = parseInt(process.env.LOCK_DURATION || 15 * 60 * 1000, 10); // 15 min
  const lockNamespace = process.env.LOCK_NAMESPACE || "auth:lockout:";

  // Register dependencies
  container.register({
    // Databases
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),
    sequelize: asValue(sequelize),

    // Config
    secretKey: asValue(jwtSecret),
    expiresIn: asValue(jwtExpiresIn),
    options: asValue({ algorithm: jwtAlgorithm }),

    maxAttempts: asValue(maxAttempts),
    lockDuration: asValue(lockDuration),
    namespace: asValue(lockNamespace),

    redisClient: asValue(redisClient),

    // Infrastructure
    logger: asValue(logger),
    passwordHasher: asValue(passwordHasher),

    // Repositories
    userRepository: asClass(UserRepository).singleton(),
    cartRepository: asClass(CartRepository).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
    bookingRepository: asClass(BookingRepository).singleton(),
    aiRepository: asClass(AiRepository).singleton(),
    locationRepository: asClass(LocationRepository).singleton(),
    paymentRepository: asClass(PaymentRepository).singleton(),
    // Services
    listingService: asClass(ListingService).singleton(),
    userService: asClass(UserService).singleton(),
    localAuthService: asClass(LocalAuthService).singleton(),
    oauthService: asClass(OAuthService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    accountLockService: asClass(AccountLockService).singleton(),
    bookingService: asClass(BookingService).singleton(),
    paymentService: asClass(PaymentService).singleton(),
    cartService: asClass(CartService).singleton(),
    aiService: asClass(AiService).singleton(),
    // machineAPI: asClass(MachineAPI).singleton(),
    locationService: asClass(LocationService).singleton(),
  });

  // Allow extra services to be injected externally
  services.forEach((service) => {
    container.register({
      [service.name]: asClass(service).singleton(),
    });
  });

  console.log("✅ AI Container initialized with DB + services");
  return container;
};

export default initializeAiContainer;
