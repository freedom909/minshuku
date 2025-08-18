import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';
import sequelize from '../models/config/seq.js';
import setupAssociations from '../models/mysql/associations.js';

// Services & Repositories
import AmenityService from '../amenityService.js';
import AmenityRepository from '../repositories/amenityRepository.js';
import UserService from '../userService/index.js';
import UserRepository from '../repositories/userRepository.js';
import LocationService from '../locationService.js';
import LocationRepository from '../repositories/locationRepository.js';

const initializeAmenityContainer = async ({ services = [] } = {}) => {
  const mysqldb = await connectMysql();
  const mongodb = await connectToMongoDB();

  // Ensure associations are set before using services
  setupAssociations();

  const container = createContainer();

  container.register({
    sequelize: asValue(sequelize),
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),

    // User
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    // Amenity
    amenityRepository: asClass(AmenityRepository).singleton(),
    amenityService: asClass(AmenityService).singleton(),
    // Location
    locationRepository: asClass(LocationRepository).singleton(),
    locationService: asClass(LocationService).singleton(),
  });

  // Optional dynamic services
  services
    .filter(service => !container.registrations[service.name])
    .forEach(service => {
      container.register({
        [service.name]: asClass(service).singleton(),
      });
    });

  console.log('✅ Amenity container initialized (MySQL + MongoDB + DI)');
  return container;
};

export default initializeAmenityContainer;
