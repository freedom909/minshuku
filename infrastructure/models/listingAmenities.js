import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';
import Listing from './listing.js';
import Location from './location.js';
import Amenity from './amenity.js';

class ListingAmenities extends Model { }

ListingAmenities.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amenityId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ListingAmenities', // Specify the model name explicitly
  timestamps: true,
});

Listing.hasOne(Location, {
  foreignKey: 'listingId', // Foreign key in the Location model
  as: 'location', // Alias should reflect a collection of locations
});
Location.belongsTo(Listing, {
  foreignKey: 'listingId', // Foreign key in the Location model
  as: 'location', // This alias must match the association in Listing
});
// Define the many-to-many relationship

Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: 'listingId', otherKey: 'amenityId', as: 'amenities' });
Amenity.belongsToMany(Listing, { through: ListingAmenities, foreignKey: 'amenityId', otherKey: 'listingId', as: 'listings' });

export default ListingAmenities;
