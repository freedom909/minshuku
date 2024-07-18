import sequelize from './sequelize.js';
import Amenity from'./amenity.js';
import Listing from './listing.js';
import ListingAmenities from './listingamenities.js';


// Define associations with compatible options

Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: 'listingId', otherKey: 'amenityId', as: 'amenities' });
Amenity.belongsToMany(Listing, { through: ListingAmenities, foreignKey: 'amenityId', otherKey: 'listingId', as: 'listings' });

const db = {
  sequelize,
  Amenity,
  Listing,
  ListingAmenities,
};

export default db;
