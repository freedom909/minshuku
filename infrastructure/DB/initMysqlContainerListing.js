import { createContainer, asValue, asClass } from 'awilix';
import connectMysql from './connectMysqlDb.js';
import ListingService from '../services/listingService.js'; 
import ListingRepository from '../repositories/listingRepository.js'  // Assuming ListingRepository is


const initializeMysqlContainerListing= async ({ services }) => {
  const mysqldb = await connectMysql(); // establishing connection to MySQL database
  const container = createContainer();
  container.register({
    mysqldb: asValue(mysqldb),
    listingRepository: asClass(ListingRepository).singleton(),
    listingService: asClass(ListingService).singleton(),
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

export default initializeMysqlContainerListing ;
