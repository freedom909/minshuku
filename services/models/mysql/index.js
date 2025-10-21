import Category from './category.js';
import Listing from './listing.js';
import Location from './location.js';
import sequelize from '../config/seq.js';
import Amenity from './amenity.js';

// // models/listing.js
// Listing.belongsToMany(Amenity, {
//   through: 'listing_amenities',
//   foreignKey: 'listingId',
//   otherKey: 'amenityId',
//   as: 'amenities', // 👈 important alias
// });

// // models/amenity.js
// Amenity.belongsToMany(Listing, {
//   through: 'listing_amenities',
//   foreignKey: 'amenityId',
//   otherKey: 'listingId',
//   as: 'listings',
// });

// Associations
Listing.belongsToMany(Category, {
  through: 'ListingCategories',
  foreignKey: 'listingId',
  otherKey: 'categoryId',
});
Category.belongsToMany(Listing, {
  through: 'ListingCategories',
  foreignKey: 'categoryId',
  otherKey: 'listingId',
});

Listing.belongsToMany(Amenity, {
  through: 'ListingAmenities',
  foreignKey: 'listingId',
  otherKey: 'amenityId',
});
Amenity.belongsToMany(Listing, {
  through: 'ListingAmenities',
  foreignKey: 'amenityId',
  otherKey: 'listingId',
});

Listing.belongsTo(Location, { foreignKey: 'locationId' });
Location.hasMany(Listing, { foreignKey: 'locationId' });


export { Listing, Category, Location, Amenity, sequelize };
