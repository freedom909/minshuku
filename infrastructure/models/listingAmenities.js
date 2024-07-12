import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';

class ListingAmenities extends Model {}

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

export default ListingAmenities;
