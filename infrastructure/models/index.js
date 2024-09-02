import sequelize from './seq.js';
import User from './user.js';
import Account from './account.js';
import Listing from './listing.js';
import Review from './review.js';
import ReviewOfGuest from './reviewOfGuest.js';
import ReviewOfHost from './reviewOfHost.js';
import Booking from './booking.js';
import Payment from './payment.js';
import Amenity from './amenity.js';
import ListingAmenities from './listingAmenities.js';
import Coordinate from './coordinate.js'; // Import Coordinate model
import Location from './location.js';


// Define associations
const models = { User, Account, Listing, Review, ReviewOfGuest, ReviewOfHost, Booking, Payment, Amenity, ListingAmenities, Coordinate, Location };

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Define associations
Listing.hasOne(models.Coordinate, { foreignKey: 'listingId', as: 'coordinate' });
Listing.hasOne(models.Location, { foreignKey: 'listingId', as: 'location' });
Coordinate.belongsTo(models.Listing, { foreignKey: 'listingId' });

// Sync database
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
