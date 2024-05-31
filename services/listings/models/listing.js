import { DataTypes } from '@sequelize/core';
import database from './sequelize.js';

const sequelize= database.sequelize;

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  costPerNight: DataTypes.FLOAT,
  title: DataTypes.STRING,
  locationType: DataTypes.STRING,
  description: DataTypes.TEXT,
  numOfBeds: DataTypes.INTEGER,
  photoThumbnail: DataTypes.STRING,
  hostId: DataTypes.UUID,
  isFeatured: DataTypes.BOOLEAN,
  latitude: DataTypes.FLOAT, // Added latitude field
  longitude: DataTypes.FLOAT, // Added longitude field
});

export default Listing;
