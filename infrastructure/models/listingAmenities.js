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
  modelName: 'ListingAmenities', // Explicit model name
  timestamps: true,
});

// Associations

// Each Listing has one Location
Listing.hasOne(Location, {
  foreignKey: 'listingId',
  as: 'location',
});

// Each Location belongs to one Listing
Location.belongsTo(Listing, {
  foreignKey: 'listingId',
  as: 'location',
});

// Define the many-to-many relationship between Listing and Amenity
Listing.belongsToMany(Amenity, {
  through: ListingAmenities,
  foreignKey: 'listingId',
  otherKey: 'amenityId',
  as: 'amenities'
});

Amenity.belongsToMany(Listing, {
  through: ListingAmenities,
  foreignKey: 'amenityId',
  otherKey: 'listingId',
  as: 'listings'
});

export default ListingAmenities;
