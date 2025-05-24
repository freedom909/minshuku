import { createContainer, asClass, asValue } from "awilix";
import Redis from "ioredis"; // 
import { createClient } from "redis";
import UserRepository from "../repositories/userRepository.js";
import LocalAuthService from "../userService/localAuthService.js";
import OAuthService from "../userService/oauthService.js";
import TokenService from "../userService/tokenService.js";
import initMongoContainer from "../DB/initMongoContainer.js";
import UserService from "../userService/index.js";
import AccountLockService from "../userService/accountLockService.js";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
dotenv.config();


const redisClient = createClient({ url: process.env.REDIS_URL || "redis://127.0.0.1:6379" });
await redisClient.connect();
const validateEnvironment = () => {
  const requiredVars = [
    "JWT_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  if (
    process.env.JWT_SECRET === "default_secret" ||
    process.env.JWT_SECRET === "default"
  ) {
    throw new Error(
      "JWT_SECRET must be properly configured with a secure value"
    );
  }
};

const initAuthContainer = async () => {
  try {
    validateEnvironment();

    const mongodb = await initMongoContainer();
    if (!mongodb) {
      throw new Error("Failed to initialize MongoDB connection");
    }

    const container = createContainer();

   

    // 🔹 Register all services and values
    container.register({
      logger: asValue(logger), // <--- register logger
      // Clients
      mongodb: asValue(mongodb),
      redisClient: asValue(redisClient), // <--- register redisClient
      maxAttempts: asValue(parseInt(process.env.MAX_LOGIN_ATTEMPTS || "10")),
      lockDuration: asValue(parseInt(process.env.LOCK_DURATION || "300")), // 5 minutes in seconds
      namespace: asValue("auth:lockout:"),
      // Repositories
      userRepository: asClass(UserRepository).singleton(),

      // Services
      userService: asClass(UserService).singleton(),
      localAuthService: asClass(LocalAuthService).singleton(),
      oauthService: asClass(OAuthService).singleton(),
      tokenService: asClass(TokenService).singleton(),
      accountLockService: asClass(AccountLockService)
        .inject(() => ({
          redisClient: container.resolve("redisClient"),
          logger: container.resolve("logger"),
          maxAttempts: container.resolve("maxAttempts"),
          lockDuration: parseInt(process.env.LOCK_DURATION || "300"),
          namespace: "auth:lockout:",
        }))
        .singleton(),

      // Environment values
      expiresIn: asValue(process.env.JWT_EXPIRES_IN || "1h"),
      secretKey: asValue(process.env.JWT_SECRET),
      googleClientId: asValue(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: asValue(process.env.GOOGLE_CLIENT_SECRET),
      googleRedirectUri: asValue(process.env.GOOGLE_REDIRECT_URI),
    });

    console.log("✅ Auth container initialized successfully");
    return container;
  } catch (error) {
    console.error("❌ Failed to initialize user container:", error);
    throw error;
  }
};

export default initAuthContainer;
