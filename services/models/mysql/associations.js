import Listing from './listing.js';
import Category from './category.js';
import Amenity from './amenity.js';
import ListingAmenities from './listingAmenities.js';

// One-to-One: Listing <-> Category
Listing.hasOne(Category, { foreignKey: 'listingId', as: 'category' });
Category.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Many-to-Many: Listing <-> Amenity
Listing.belongsToMany(Amenity, {
  through: ListingAmenities,
  foreignKey: 'listingId',
  as: 'amenities',
});
Amenity.belongsToMany(Listing, {
  through: ListingAmenities,
  foreignKey: 'amenityId',
  as: 'listings',
});

export default function setupAssociations() {
  console.log('✅ Associations set up');
}
