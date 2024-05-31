import { Model, DataTypes } from '@sequelize/core';
import sequelize from './sequelize.js';


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
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true, // Initially allow null values
  },
  longitude: {
    type: DataTypes.FLOAT, 
    allowNull: true, // Initially allow null values
  },
  
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, 

{
  sequelize,
  modelName: 'Listing',
  timestamps: true,
  
});

export default Listing;