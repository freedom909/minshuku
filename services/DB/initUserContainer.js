// infrastructure/DB/initUserContainer.js
import { createContainer, asClass, asValue, asFunction } from 'awilix';
import UserRepository from '../repositories/userRepository.js';
import LocalAuthService from '../userService/localAuthService.js';
import OAuthService from '../userService/oauthService.js';
import TokenService from '../userService/tokenService.js';
import connectToMongoDB from './connectMongoDB.js';
import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from.env file

const initUserContainer = async () => {
    const mongodb = await connectToMongoDB();
    const container = createContainer();

    container.register({
        mongodb: asValue(mongodb),
        userRepository: asClass(UserRepository).singleton(),
        secretKey: asValue(process.env.JWT_SECRET || 'good'),
        expiresIn: asValue('1h'),
        localAuthService: asClass(LocalAuthService).singleton(),
        tokenService: asClass(TokenService).singleton(),
        oAuthService: asFunction(({ tokenService, userRepository }) => new OAuthService({ tokenService, userRepository })).singleton()
        // Ensure this line exists
    });

    return container;
};

export default initUserContainer;

