// container.js
import { createContainer, asClass, asValue } from 'awilix';
import { connectToDB } from './mysqlDB.js'; // Adjust the path as necessary
import UserRepository from '../repositories/userRepository.js'; // Adjust the path as necessary
import UserService from '../services/userService.js'; // Adjust the path as necessary
import AccountService from '../services/accountService.js'; // Adjust the path as necessary
import BookingService from '../services/bookingService.js'; // Adjust the path as necessary
import ListingService from '../services/listingService.js'; // Adjust the path as necessary
import sequelize from '../models/seq.js';

const container = createContainer();

const initializeContainer = async () => {
  
  container.register({
    db: asValue(sequelize),
    listingService: asClass(ListingService).singleton(),
  });

  await sequelize.authenticate();
  console.log('MySQL Database connected for Listings!');

  return container;
};

export { initializeContainer,container};


