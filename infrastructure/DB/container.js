// container.js
import { createContainer, asClass, asValue } from 'awilix';
import { connectToDB } from './mysqlDB.js'; // Adjust the path as necessary
import UserRepository from '../repositories/userRepository.js'; // Adjust the path as necessary
import UserService from '../services/userService.js'; // Adjust the path as necessary
import AccountService from '../services/accountService.js'; // Adjust the path as necessary
import BookingService from '../services/bookingService.js'; // Adjust the path as necessary
import ListingService from '../services/listingService.js'; // Adjust the path as necessary

const container = createContainer();

const initializeContainer = async () => {
  const db = await connectToDB(); // Initialize the database connection
  container.register({
    db: asValue(db), // Use the db object instead of pool
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    accountService: asClass(AccountService).singleton(),
    bookingService: asClass(BookingService).singleton(),
    listingService: asClass(ListingService).singleton(),
  });
};

export { container, initializeContainer };
