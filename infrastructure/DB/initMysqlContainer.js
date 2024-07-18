// container.js
import { createContainer, asClass, asValue } from 'awilix';
import { connectToDB } from './connectMysqlDB.js'; // Adjust the path as necessary
import UserRepository from '../repositories/userRepository.js'; // Adjust the path as necessary
import UserService from '../services/userService.js'; // Adjust the path as necessary
import AccountService from '../services/accountService.js'; // Adjust the path as necessary
import BookingService from '../services/bookingService.js'; // Adjust the path as necessary
import ListingService from '../services/listingService.js'; // Adjust the path as necessary
import sequelize from '../models/seq.js';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config();

const user=process.env.DB_USER
const password=process.env.DB_PASSWORD
const dbname=process.env.DB_NAME
const sequelize=new Sequelize(user, password, dbname,{
  host: 'localhost',
  dialect:'mysql',
  logging: false,
})

const initializeMysqlContainer = async ({services}) => {
  const container = createContainer();
  container.register({
    db: asValue(sequelize),
  });

  //register services dynamically
  services.forEach(service => {
    container.register({
      [service.name]: asClass(service).singleton(),
    });
  });

  //register models dynamically
  const models =  sequelize.models;
  Object.values(models).forEach(model => {
    container.register({
      [model.name]: asValue(model),
    });
  });

  await sequelize.authenticate();
  console.log('MySQL Database connected');

  return container;
};

export default initializeMysqlContainer


