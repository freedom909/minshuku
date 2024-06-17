import sequelize from './seq.js';
import User from './user.js';
import Account from './account.js';
import Listing from './listing.js';
import Review from './review.js';
import ReviewOfGuest from './reviewOfGuest.js';
import ReviewOfHost from './reviewOfHost.js';
import Booking from './booking.js';
import Payment from './payment.js';
import Amenity from './Amenity.js';
import ListingAmenities from './listingAmenities.js';

// Define associations
Listing.associate = (models) => {
  Listing.hasMany(models.ReviewOfGuest, { foreignKey: 'listingId', as: 'guestReviews' });
  Listing.hasMany(models.ReviewOfHost, { foreignKey: 'listingId', as: 'hostReviews' });
  Listing.hasMany(models.Booking, { foreignKey: 'listingId', as: 'bookings' });
  Listing.hasMany(models.Payment, { foreignKey: 'listingId', as: 'payments' });
  Listing.belongsToMany(models.Amenity, { through: models.ListingAmenities, foreignKey: 'listingId', as: 'amenities' });
  Listing.belongsTo(models.User, { foreignKey: 'hostId', as: 'host' });
};

ReviewOfGuest.associate = (models) => {
  ReviewOfGuest.hasOne(models.ReviewOfHost, { foreignKey: 'reviewGuestId', as: 'hostReply' });
};

ReviewOfHost.associate = (models) => {
  ReviewOfHost.belongsTo(models.ReviewOfGuest, { foreignKey: 'reviewGuestId', as: 'guestReview' });
};

// Amenity.associate = (models) => {
//   Amenity.belongsToMany(models.Listing, { through: models.ListingAmenities, foreignKey: 'amenityId', as: 'listings' });
// };

User.associate = (models) => {
  User.hasOne(models.Account, { foreignKey: 'userId', as: 'account' });
  User.hasMany(models.ReviewOfGuest, { foreignKey: 'guestId', as: 'guestReviews' });
  User.hasMany(models.ReviewOfHost, { foreignKey: 'hostId', as: 'hostReviews' });
  User.hasMany(models.Booking, { foreignKey: 'guestId', as: 'bookings' });
};

Booking.associate = (models) => {
  Booking.belongsTo(models.User, { foreignKey: 'guestId', as: 'guest' });
  Booking.belongsTo(models.Listing, { foreignKey: 'listingId', as: 'listing' });
  Booking.hasMany(models.Payment, { foreignKey: 'bookingId', as: 'payments' });
};

Payment.associate = (models) => {
  Payment.belongsTo(models.Booking, { foreignKey: 'bookingId', as: 'booking' });
};

const models = { User, Account, Listing, Review, ReviewOfGuest, ReviewOfHost, Booking, Payment, Amenity, ListingAmenities };

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
})();
