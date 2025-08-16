// initializeLocationContainer.js
import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDB.js';
import connectToMongoDB from './connectMongoDB.js';
import sequelize from '../models/config/seq.js';

import UserService from '../userService/index.js';
import UserRepository from '../repositories/userRepository.js';

import LocationService from '../locationService.js';
import LocationRepository from '../repositories/locationRepository.js';

const initializeLocationContainer = async ({ services = [] } = {}) => {
  // Connect to MySQL and MongoDB
  const mysqldb = await connectMysql();
  const mongodb = await connectToMongoDB();

  // Create DI container
  const container = createContainer();

  container.register({
    sequelize: asValue(sequelize),
    mysqldb: asValue(mysqldb),
    mongodb: asValue(mongodb),

    // User
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),

    // Location
    locationRepository: asClass(LocationRepository).singleton(),
    locationService: asClass(LocationService).singleton(),
  });

  // Register any additional services if they aren't already registered
  services
    .filter(service => !container.registrations[service.name])
    .forEach(service => {
      container.register({
        [service.name]: asClass(service).singleton(),
      });
    });

  console.log('Location subgraph: Databases connected and services initialized');
  return container;
};

export default initializeLocationContainer;
