// initializeAmenityContainer.js
import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';
import sequelize from '../models/seq.js';

// Core domain services/repositories for Amenities subgraph
import UserService from '../userService/index.js';
import UserRepository from '../repositories/userRepository.js';
import AmenityService from '../amenityService.js';
import AmenityRepository from '../repositories/amenityRepository.js';

const initializeAmenityContainer = async ({ services = [] } = {}) => {
  // Connect to databases in parallel
  const [mysqldb, mongodb] = await Promise.all([
    connectMysql(),
    connectToMongoDB()
  ]);

  // Create container
  const container = createContainer();

  // Utility to check if a value is a class
  const isClass = (fn) =>
    typeof fn === 'function' && /^class\s/.test(Function.prototype.toString.call(fn));

  // Register core dependencies
  container.register({
    sequelize: asValue(sequelize),
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),

    userRepository: isClass(UserRepository)
      ? asClass(UserRepository).singleton()
      : asValue(UserRepository),

    userService: isClass(UserService)
      ? asClass(UserService).singleton()
      : asValue(UserService),

    amenityRepository: isClass(AmenityRepository)
      ? asClass(AmenityRepository).singleton()
      : asValue(AmenityRepository),

    amenityService: isClass(AmenityService)
      ? asClass(AmenityService).singleton()
      : asValue(AmenityService),
  });

  // Optionally register additional services
  services
    .filter((service) => !container.registrations[service.name])
    .forEach((service) => {
      container.register({
        [service.name]: isClass(service)
          ? asClass(service).singleton()
          : asValue(service),
      });
    });

  console.log('Databases connected and services initialized for Amenity subgraph');
  return container;
};

export default initializeAmenityContainer;
