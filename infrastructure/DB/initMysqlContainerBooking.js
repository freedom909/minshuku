import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDb.js';
import BookingRepository from '../repositories/BookingRepository.js'  // Assuming BookingRepository is in the same directory as this.;
import BookingService from '../services/BookingService.js'  // Assuming BookingService is in the same directory as;
import ListingService from '../services/listingService.js'; 
import BookingService from '../services/bookingService.js';  
import UserService from '../services/userService.js';
import PaymentService from '../services/paymentService.js';

const initializeMysqlContainerBooking = async ({ services }) => {
  const mysqldb = await connectMysql(); // establishing connection to MySQL database
  const container = createContainer();
  container.register({
    mysqldb: asValue(mysqldb),
    bookingRepository: asClass(BookingRepository).singleton(),
    bookingService: asClass(BookingService).singleton(),
  });

  // Register services dynamically
  services.forEach(service => {
    container.register({
      [service.name]: asClass(service).singleton(),
    });
  });
  
  console.log('MySQL Database connected');
  return container;
};

export default initializeMysqlContainerBooking ;
