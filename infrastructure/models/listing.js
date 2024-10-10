import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js  

class Listing extends Model { }

Listing.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false, // You might want to enforce this  
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Adjust based on requirements  
  },
  costPerNight: {
    type: DataTypes.FLOAT,
    allowNull: false, // You might want to enforce this  
  },
  hostId: {
    type: DataTypes.STRING,
    allowNull: false, // You might want to enforce this  
  },
  locationId: {
    type: DataTypes.STRING,
    allowNull: false, // You might want to enforce this  
  },
  numOfBeds: {
    type: DataTypes.INTEGER,
    allowNull: true, // Adjust based on requirements  
  },
  photoThumbnails: {
    type: DataTypes.JSON, // Use JSON to store an array of URLs  
    allowNull: true, // Adjust based on requirements  
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Set default value  
  },
  saleAmount: {
    type: DataTypes.FLOAT,
    allowNull: true, // Adjust based on requirements  
  },
  bookingNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Optional default value  
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Automatically set to now  
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW, // Automatically set to now  
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: true, // Adjust based on requirements  
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: true, // Adjust based on requirements  
  },
  amenityIds: {
    type: DataTypes.JSON, // Use JSON to store an array of amenity IDs  
    allowNull: true, // Adjust based on requirements  
  },
  bookingIds: {  //
    type: DataTypes.JSON, // Use JSON to store an array of booking IDs  
    allowNull: true, // Adjust based on requirements  
  },
  reviewIds: {
    type: DataTypes.JSON, // Use JSON to store an array of review IDs  
    allowNull: true, // Adjust based on requirements  
  },
  hostId: {
    type: DataTypes.STRING,
    allowNull: false, // You might want to enforce this  
  },
  listingStatus: {
    type: DataTypes.ENUM,
    values: ['ACTIVE', 'PENDING', 'SOLD', 'DELETED', 'REJECT', 'CANCELLED', 'EXPIRED', 'COMPLETED', 'AVAILABLE', 'PUBLISHED'],
    allowNull: false, // You might want to enforce this  
  },
}, {
  sequelize,
  modelName: 'Listing',
  timestamps: true, // This will automatically add createdAt and updatedAt fields  
});


Listing.associate = (models) => {
  Listing.hasMany(models.Booking, { foreignKey: 'listingId', as: 'bookings' });
  // If relevant, you can also associate BookingItem if listings can have items.  
};
// Export the model  
export default Listing;