import { asClass, asValue, createContainer } from 'awilix';
import dotenv from 'dotenv';
dotenv.config();

import UserRepository from '../repositories/userRepository.js';
import UserService from '../services/userService.js';
import AccountService from '../services/accountService.js';
import BookingService from '../services/bookingService.js';
import ListingService from '../services/listingService.js';
import pkg from 'mongodb';
const { MongoClient } = pkg;

const container = createContainer();
async function connectToDB() {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected');  
    return client.db(process.env.DB_NAME);
}

const initializeContainer=async () => {
  const db=await connectToDB();
container.register({
    db: asValue(db),
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    accountService: asClass(AccountService).singleton(),
    bookingService: asClass(BookingService).singleton(),
    listingService: asClass(ListingService).singleton()
});
}
export { container, initializeContainer };