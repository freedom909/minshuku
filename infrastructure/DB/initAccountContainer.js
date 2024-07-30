// infrastructure/DB/initMongoContainer.js
import pkg from 'mongodb';
const { MongoClient } = pkg;
import { createContainer, asClass, asValue } from 'awilix';
import UserRepository from '../repositories/userRepository.js';
import UserService from '../services/userService.js';
import connectMongoDB from './connectMongoDb.js';

import ProfileService from '../services/proflieService.js';
import ProfileRepository from '../repositories/profileRepository.js';
import AccountService from '../services/accountService.js';
import AccountRepository from '../repositories/accountRepository.js';
import ReviewService from '../services/reviewService.js';
import ReviewRepository from '../repositories/reviewRepository.js';
import ListingService from '../services/listingService.js';

import ListingRepository from '../repositories/listingRepository.js';

const initAccountContainer = async () => {
  try {
  const mongodb = await connectMongoDB();
  console.log('MongoDB Database connected');
  const container = createContainer();
  container.register({
    mongodb: asValue(mongodb),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    accountService: asClass(AccountService).singleton(),
    accountRepository: asClass(AccountRepository).singleton(),
    profileService: asClass(ProfileService).singleton(),
    profileRepository: asClass(ProfileRepository).singleton(),
    reviewService: asClass(ReviewService).singleton(),
    reviewRepository: asClass(ReviewRepository).singleton(),
    listingService: asClass(ListingService).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
  });
  return container;
}catch (err){
  console.error('Error connecting to MongoDB:', err);
 }
};

export default initAccountContainer;
