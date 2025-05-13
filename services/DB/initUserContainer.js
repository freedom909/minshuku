//services/DB/initUserContainer.js
import { createContainer, asClass, asValue } from 'awilix';
import UserRepository from '../repositories/userRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import OAuthService from '../userService/oauthService.js';
import TokenService from '../userService/tokenService.js';
import initMongoContainer from '../DB/initMongoContainer.js';

const initUserContainer = async () => {
  const mongodb = await initMongoContainer(); // ✅ ensure it returns db object

  const container = createContainer();

  container.register({
    mongodb: asValue(mongodb), // ✅ 
    userRepository: asClass(UserRepository).singleton(),
    localAuthService: asClass(LocalAuthService).singleton(),
    oauthService: asClass(OAuthService).singleton(),
    tokenService: asClass(TokenService).singleton(),
    expiresIn: asValue(process.env.JWT_EXPIRES_IN || '1h'),
    secretKey: asValue(process.env.JWT_SECRET || 'default_secret'),
  });

  return container;
};

export default initUserContainer;