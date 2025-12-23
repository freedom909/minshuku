// infrastructure/container/initializeAiContainer.js
import dotenv from "dotenv";
dotenv.config();
import { createContainer, asValue, asClass } from "awilix";
// DB connectors

import connectToMongoDB from "./connectMongoDB.js";


// Repositories
import UserRepository from "../repositories/userRepository.js";
import UserService from "../userService/index.js";
import LocalAuthService from "../userService/localAuthService.js";
import OAuthService from "../userService/oauthService.js";
import TokenService from "../userService/tokenService.js";
import AccountLockService from "../userService/accountLockService.js";
import AuditLogRepository from "../repositories/auditLogRepository.js";
import AdminService from "../accountServices/index.js";
// Infrastructure
import redisClient from "../redisClient.js";
import logger from "../../infrastructure/utils/logger.js";
import passwordHasher from "../../infrastructure/helpers/passwordHasher.js";

const initializeAdminContainer = async ({ services = [] } = {}) => {
  // Connect DBs
  
  const mongodb = await connectToMongoDB();
  const container = createContainer();

  // Config values from .env (with safe defaults)
  const jwtSecret = process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";
  const jwtAlgorithm = process.env.JWT_ALGORITHM || "HS256";

  const maxAttempts = parseInt(process.env.MAX_ATTEMPTS || "5", 10);
  const lockDuration = parseInt(process.env.LOCK_DURATION || 15 * 60 * 1000, 10); // 15 min
  const lockNamespace = process.env.LOCK_NAMESPACE || "auth:lockout:";

  // Register dependencies
  container.register({
    // Databases
    mongodb: asValue(mongodb),
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
    // adminService: asValue(AdminService),
    // Repositories
    userRepository: asClass(UserRepository).singleton(), // Needed by UserService
    auditLogRepository: asClass(AuditLogRepository).singleton(),
    // Services
    adminService: asClass(AdminService).singleton(),
    userService: asClass(UserService).singleton(),
    localAuthService: asClass(LocalAuthService).singleton(),
    oauthService: asClass(OAuthService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    accountLockService: asClass(AccountLockService).singleton(),
    logger: asValue(console),
  });

  // Allow extra services to be injected externally
  services.forEach((service) => {
    container.register({
      [service.name]: asClass(service).singleton(),
    });
  });

  console.log("✅ Admin Container initialized with DB + services");
  return container;
};

export default initializeAdminContainer;
