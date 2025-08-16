import Listing from './listing.js';
import Location from './location.js';
import Category from './category.js';
import Amenity from './amenity.js';
import ListingAmenities from './listingAmenities.js';

// =======================
// 1. Listing ↔ Location (One-to-One)
// =======================
Location.hasOne(Listing, {
  foreignKey: 'locationId',
  as: 'listing',
});
Listing.belongsTo(Location, {
  foreignKey: 'locationId',
  as: 'location',
});

// =======================
// 2. Listing ↔ Category (One-to-One)
// =======================
Listing.hasOne(Category, {
  foreignKey: 'listingId',
  as: 'category',
});
Category.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'listing',
});

// =======================
// 3. Listing ↔ Amenity (Many-to-Many)
// =======================
Listing.belongsToMany(Amenity, {
  through: ListingAmenities,
  foreignKey: 'listingId',
  otherKey: 'amenityId',
  as: 'amenities',
});

Amenity.belongsToMany(Listing, {
  through: ListingAmenities,
  foreignKey: 'amenityId',
  otherKey: 'listingId',
  as: 'listings',
});

export default function setupAssociations() {
  // Call this once after all models are imported
  console.log('✅ Associations set up successfully');
}
