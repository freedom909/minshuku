// models/mysql/associations.js
import Listing from './listing.js';
import Location from './location.js';
import Amenity from './amenity.js';
import Category from './category.js';
import ListingAmenities from './listingAmenities.js';
import ListingCategory from './listingCategory.js';



export function setupAssociations() {
  // Listing ↔ Location (many listings belong to one location)
  Listing.belongsTo(Location, { foreignKey: 'locationId' });
  Location.hasMany(Listing, { foreignKey: 'locationId' });

  // Listing ↔ Amenities (many-to-many via ListingAmenities)
  Listing.belongsToMany(Amenity, {
    through: ListingAmenities,
    foreignKey: 'listingId',
    otherKey: 'amenityId',
  });
  Amenity.belongsToMany(Listing, {
    through: ListingAmenities,
    foreignKey: 'amenityId',
    otherKey: 'listingId',
  });

  // Listing ↔ Categories (many-to-many via ListingCategory)
  Listing.belongsToMany(Category, {
    through: ListingCategory,
    foreignKey: 'listingId',
    otherKey: 'categoryId',
  });
  Category.belongsToMany(Listing, {
    through: ListingCategory,
    foreignKey: 'categoryId',
    otherKey: 'listingId',
  });
}
