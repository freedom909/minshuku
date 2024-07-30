import { Model, DataTypes } from 'sequelize'; // Correct import path for Sequelize
import sequelize from './sequelize.js'; // Ensure this path is correct

class Listing extends Model {}

Listing.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  costPerNight: DataTypes.FLOAT,
  hostId: DataTypes.STRING,
  locationType: DataTypes.STRING,
  numOfBeds: DataTypes.INTEGER,
  photoThumbnail: DataTypes.STRING,
  isFeatured: DataTypes.BOOLEAN,
  saleAmount: DataTypes.FLOAT,
  bookingNumber: DataTypes.INTEGER,
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true, // Initially allow null values
  },
  longitude: {
    type: DataTypes.FLOAT, 
    allowNull: true, // Initially allow null values
  },
  saleAmount:DataTypes.FLOAT,
  bookingNumber:DataTypes.INTEGER
}, 
{
  sequelize,
  modelName: 'Listing',
  timestamps: true, // This enables createdAt and updatedAt fields
});

export default Listing;
