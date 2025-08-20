// models/listing.js
Listing.belongsToMany(Amenity, {
  through: 'listing_amenities',
  foreignKey: 'listingId',
  otherKey: 'amenityId',
  as: 'amenities', // 👈 important alias
});

// models/amenity.js
Amenity.belongsToMany(Listing, {
  through: 'listing_amenities',
  foreignKey: 'amenityId',
  otherKey: 'listingId',
  as: 'listings',
});
