// // services/DB/initAuthContainer.js
// import { createContainer, asClass, asValue, asFunction } from 'awilix';
// import { config } from 'dotenv';
// import bcrypt from 'bcryptjs';
// import googleMockProvider from '../auth/oauth/providers/mock.provider.js';

// import initMongoContainer from './initMongoContainer.js';
// import initRedisClient from './initRedisClient.js';

// /* ---------- repositories ---------- */
// import UserRepository from '../repositories/userRepository.js';

// /* ---------- domain services ---------- */
// import UserService from '../userService/index.js';
// import AccountLockService from '../userService/accountLockService.js';

// /* ---------- auth / token ---------- */
// import TokenService from '../userService/tokenService.js';
// import AuthService from '../authService/index.js';
// import OAuthLoginAdapter from '../authService/oauthLoginAdapter.js';

// /* ---------- OAuth (NEW ARCH) ---------- */
// import OAuthService from '../oauth/OAuthService.js';
// import {
//   GoogleOAuth,
//   FacebookOAuth,
//   GithubOAuth,
// } from '../userService/providers/index.js';

// /* ---------- utils ---------- */
// import logger from '../../infrastructure/utils/logger.js';

// config();

// /* ---------------------------------- */
// /* env validation                     */
// /* ---------------------------------- */
// const validateEnvironment = () => {
//   const requiredVars = [
//     'JWT_PRIVATE_KEY_PATH',
//     'JWT_PUBLIC_KEY_PATH',
//     'GOOGLE_CLIENT_ID',
//     'GOOGLE_CLIENT_SECRET',
//     'GOOGLE_REDIRECT_URI',
//     'FACEBOOK_CLIENT_ID',
//     'FACEBOOK_CLIENT_SECRET',
//     'FACEBOOK_REDIRECT_URI',
//     'GITHUB_CLIENT_ID',
//     'GITHUB_CLIENT_SECRET',
//     'GITHUB_REDIRECT_URI',
//   ];

//   const missingVars = requiredVars.filter(v => !process.env[v]);
//   if (missingVars.length) {
//     throw new Error(`❌ Missing env vars: ${missingVars.join(', ')}`);
//   }

//   console.log("✅ Environment variables validated (RS256 + JWKS)");
// };


// /* ---------------------------------- */
// /* container init                     */
// /* ---------------------------------- */
// const initAuthContainer = async () => {
//   validateEnvironment();

//   const mongodb = await initMongoContainer();
//   const redisClient = await initRedisClient();

//   const container = createContainer();

//   container.register({
//     /* ---------- infra ---------- */
//     mongodb: asValue(mongodb),
//     redisClient: asValue(redisClient),
//     logger: asValue(logger),

//     /* ---------- repositories ---------- */
//     userRepository: asClass(UserRepository).singleton(),

//     /* ---------- security ---------- */
//     passwordHasher: asValue({
//       hash: bcrypt.hash,
//       compare: bcrypt.compare,
//     }),
// providers: asValue({
//   GOOGLE: googleMockProvider,
// }),


//     /* ---------- account lock ---------- */
//     accountLockService: asFunction(
//       ({ redisClient }) =>
//         new AccountLockService({
//           redisClient,
//           maxAttempts: 10,
//           lockDuration: 900,
//           namespace: 'auth',
//         })
//     ).singleton(),

//     /* ---------- token (RS256 / JWKS) ---------- */
//     tokenService: asClass(TokenService).singleton(),

//     /* ---------- OAuth providers ---------- */
//     googleOAuthProvider: asFunction(
//       () =>
//         new GoogleOAuth({
//           clientId: process.env.GOOGLE_CLIENT_ID,
//           clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         })
//     ).singleton(),

//     facebookOAuthProvider: asFunction(
//       () =>
//         new FacebookOAuth({
//           clientId: process.env.FACEBOOK_CLIENT_ID,
//           clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//         })
//     ).singleton(),

//     githubOAuthProvider: asFunction(
//       () =>
//         new GithubOAuth({
//           clientId: process.env.GITHUB_CLIENT_ID,
//           clientSecret: process.env.GITHUB_CLIENT_SECRET,
//         })
//     ).singleton(),

//     /* ---------- OAuthService (profile only) ---------- */
//     oauthService: asFunction((c) =>
//       new OAuthService({
//         googleProvider: c.resolve('googleOAuthProvider'),
//         facebookProvider: c.resolve('facebookOAuthProvider'),
//         githubProvider: c.resolve('githubOAuthProvider'),
//       })
//     ).singleton(),

//     /* ---------- domain ---------- */
//     userService: asClass(UserService).singleton(),

//     /* ---------- login adapter (CORE) ---------- */
//     oauthLoginAdapter: asClass(OAuthLoginAdapter).singleton(),

//     /* ---------- entry auth service ---------- */
//     authService: asClass(AuthService).singleton(),
//   });

//   console.log('✅ User container initialized (FINAL)');
//   return container;
// };

// export default initAuthContainer;

import { createContainer, asClass, asFunction, asValue } from "awilix";
import bcrypt from "bcryptjs";
import initMongoContainer from "./initMongoContainer.js";
import OAuthService from "../auth/oauth/OAuthService.js";
import mockGoogleProvider from "../auth/oauth/providers/mock.provider.js";
import RefreshTokenService from "../auth/refresh/refreshTokenService.js";

import OAuthLoginAdapter from '../authService/oauthLoginAdapter.js';
import UserService from "../userService/index.js";
import TokenService from "../userService/tokenService.js";
import UserRepository from "../repositories/userRepository.js";

const initAuthContainer = async () => {
  const container = createContainer();
  const mongodb = await initMongoContainer();

  container.register({
    /* ---------- utils ---------- */
    passwordHasher: asValue({
      hash: bcrypt.hash,
      compare: bcrypt.compare,
    }),
    mongodb: asValue(mongodb),
    /* ---------- repositories ---------- */
    userRepository: asClass(UserRepository).singleton(),

    /* ---------- services ---------- */
    userService: asClass(UserService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    refreshTokenService: asClass(RefreshTokenService).singleton(),

    /* ---------- OAuth providers (核心！) ---------- */
    providers: asValue({
      GOOGLE: mockGoogleProvider,
    }),

    /* ---------- OAuthService ---------- */
    oauthService: asClass(OAuthService).singleton(),
   oauthLoginAdapter: asClass(OAuthLoginAdapter).singleton(),
  });

  console.log("✅ Auth container initialized (DEBUG MODE)");
  return container;
};

export default initAuthContainer;
