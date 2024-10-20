import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';
import ListingService from '../services/listingService.js';
import ListingRepository from '../repositories/listingRepository.js';
import UserService from '../services/userService.js';
import UserRepository from '../repositories/userRepository.js';
import sequelize from '../models/seq.js';  // Import your Sequelize instance
import AmenityService from '../services/amenityService.js';
import LocationService from '../services/locationService.js';
import LocationRepository from '../repositories/locationRepository.js';


const initializeListingContainer = async ({ services = [] } = {}) => {
  // Establishing connection to MySQL database
  const mysqldb = await connectMysql();

  // Establishing connection to MongoDB database
  const mongodb = await connectToMongoDB();

  // Initializing the container and registering dependencies and services
  const container = createContainer();
  container.register({
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),
    sequelize: asValue(sequelize),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
    listingService: asClass(ListingService).singleton(),
    amenityService: asClass(AmenityService).singleton(),
    locationService: asClass(LocationService).singleton(),
    locationRepository: asClass(LocationRepository).singleton(),

  });

  // Register services dynamically
  services.forEach(service => {
    container.register({
      [service.name]: asClass(service).singleton(),
    });
  });

  console.log('Database connected');
  return container;
};

export default initializeListingContainer;
