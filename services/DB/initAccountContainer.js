import pkg from 'mongodb';
const { MongoClient } = pkg;
import { createContainer, asClass, asValue } from 'awilix';
import connectToMongoDB from './connectMongoDB.js';
import AccountService from '../accountService.js';
import AccountRepository from '../repositories/accountRepository.js';
import UserService from '../userService/index.js';
import UserRepository from '../repositories/userRepository.js';
import connectMysql from './connectMysqlDB.js';
import connectNeo4j from './connectNeo4jDB.js';
import ListingRepository from '../repositories/listingRepository.js';
import ListingService from '../listingService.js';
import CartRepository from '../repositories/cartRepository.js';
import CartService from '../cartService.js';

const initAccountContainer = async ({ services = [] } = {}) => {
  let mongodb;
  let mysqldb;
  let neo4jdb;

  try {
    // Establish connection to MongoDB database
    mongodb = await connectToMongoDB();
    console.log('Connected to MongoDB database');
  } catch (error) {
    console.error('Error connecting to MongoDB database:', error);
    throw error;
  }

  try {
    mysqldb = await connectMysql();
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    throw error;
  }

  try {
    neo4jdb = await connectNeo4j();
    console.log('Connected to Neo4j database');
  } catch (error) {
    console.error('Error connecting to Neo4j database:', error);
    throw error;
  }

  // Create a container and register services and repositories
  const container = createContainer();
  container.register({
    mongodb: asValue(mongodb),
    mysqldb: asValue(mysqldb),
    neo4jdb: asValue(neo4jdb),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    accountService: asClass(AccountService).singleton(),
    accountRepository: asClass(AccountRepository).singleton(),
    listingRepository: asClass(ListingRepository).singleton(),
    listingService: asClass(ListingService).singleton(),
    cartRepository: asClass(CartRepository).singleton(),
    cartService: asClass(CartService).singleton(),
  });
  return container;
};

export default initAccountContainer;
