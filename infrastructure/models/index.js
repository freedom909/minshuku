import mongoose from 'mongoose';
import User from '../User.js';
import Account from './account.js';
import Listing from './listing.js';
import Location from './location.js';

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const db = {
  mongoose,
  User,
  Account,
  Listing,
  Location
};

export default db;
