// container.js
import { createContainer, asValue, asClass } from 'awilix';
import dbconfig from './dbconfig.js';
import ListingService from '../services/listingService.js';
import ListingRepository from '../repositories/listingRepository.js';
import UserService from '../services/userService.js';
import UserRepository from '../repositories/userRepository.js';
import AmenityService from '../services/amenityService.js';
import axios from 'axios';

const initializeAmenityContainer = async ({ services = [] } = {}) => {
  // Establishing connection to MySQL and MongoDB databases
  const mysqldb = await dbconfig.mysql();
  const mongodb = await dbconfig.mongo();

  // Initialize the container and register dependencies and services
  const container = createContainer();
  container.register({
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),
    httpClient: asValue(axios.create({ baseURL: 'http://external-api.example.com' })), // Change this to the actual external API base URL
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
    listingService: asClass(ListingService).singleton(),
    amenityService: asClass(AmenityService).singleton(),
    // Add more services here...
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

export default initializeAmenityContainer;
