import { v4 as uuidv4 } from 'uuid';
import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Adjust the path as necessary
import Location from './location.js';

class Listing extends Model { }

Listing.init({
  id: {
    type: DataTypes.UUID,         // Use UUID as the ID type
    defaultValue: uuidv4(),      // Automatically generate UUID for new records
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  costPerNight: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  hostId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  locationId: {
    type: DataTypes.UUID,         // Use UUID as the ID type
    allowNull: false,
    unique: true,
  },
  numOfBeds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pictures: {
    type: DataTypes.JSON, // Store array of picture URLs
    allowNull: false,
    defaultValue: ["pic1.jpg", "pic2.jpg"]
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  saleAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  bookingNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  listingStatus: {
    type: DataTypes.ENUM('ACTIVE', 'PENDING', 'SOLD', 'DELETED', 'REJECT', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'AVAILABLE', 'PUBLISHED'),
    allowNull: false,
  },
  locationType: {
    type: DataTypes.ENUM('SPACESHIP', 'HOUSE', 'CAMPSITE', 'APARTMENT', 'ROOM'),
    allowNull: false,
    defaultValue: 'ROOM', // Add a default value
  },
}, {
  sequelize,
  modelName: 'Listing',
  timestamps: false,

});

// Defining associations
Listing.associate = (models) => {
  Listing.hasMany(models.Booking, { foreignKey: 'listingId', as: 'bookings' });
  Listing.belongsToMany(models.Amenity, { through: 'ListingAmenities', foreignKey: 'listingId', as: 'amenities' });

  Listing.belongsTo(Location, { as: 'location', foreignKey: 'locationId' });

  // Location model
  // Location model
  Location.hasOne(Listing, { as: 'listing', foreignKey: 'locationId' });
};

export default Listing;
