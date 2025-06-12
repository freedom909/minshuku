

import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';

class Listing extends Model { }

Listing.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  hostId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  // latitude: {
  //   type: DataTypes.FLOAT,
  //   allowNull: false,
  // },
  // longitude: {
  //   type: DataTypes.FLOAT,
  //   allowNull: false,
  // },
  numOfBeds: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  costPerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  locationType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listingStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  modelName: 'Listing',
});

export default Listing;

