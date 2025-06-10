// infrastructure/DB/initMongoContainer.js
import mongoose from 'mongoose';
import { createContainer, asClass, asValue } from 'awilix';
// import UserRepository from '../repositories/userRepository.js';
// import UserService from '../userService/index.js';
import ProfileService from '../profileService.js';
import ProfileRepository from '../repositories/profileRepository.js';
import connectMongoDB from './connectMongoDB.js';

const initProfileContainer = async () => {
  try {
    const mongodb = await connectMongoDB();
    console.log('MongoDB Database connected');

    const container = createContainer();
    container.register({
      mongodb: asValue(mongodb),
      // userRepository: asClass(UserRepository).singleton(),
      // userService: asClass(UserService).singleton(),
      profileService: asClass(ProfileService).singleton(),
      profileRepository: asClass(ProfileRepository).singleton(),
    });

    return container;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err; // optional: bubble it up so the server doesn't silently continue
  }
};

export default initProfileContainer;
