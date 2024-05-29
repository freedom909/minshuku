import { Sequelize }  from '@sequelize/core';
import sequelize from './sequelize.js';
import Amenity from './amenity.js';
import Listing from './listing.js';
import ListingAmenities from './listingamenities.js';

// Define associations with compatible options
Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: 'listingId', otherKey: 'amenityId' });
Amenity.belongsToMany(Listing, { through: ListingAmenities, foreignKey: 'amenityId', otherKey: 'listingId' });


const db = {
  sequelize,
  Sequelize,
  Amenity,
  Listing,
  ListingAmenities,
};

export default db;
