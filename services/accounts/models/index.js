import connectDB from '../config/database.js';
// import User from './user.js';
// import Account from './account.js';
// import Listing from './listing.js';
// import Location from './location.js';

// Connect to the database
connectDB();

// Export the models
export {
  User,
  Account,
  Listing,
  Location
};
