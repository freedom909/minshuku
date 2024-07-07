import { DataTypes, Model } from 'sequelize';
import sequelize from './sequelize.js';

// Amenity model
class Amenity extends Model {}
Amenity.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
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
  modelName: 'Amenity',
  timestamps: true,
});

export default Amenity;

// Repeat similar setup for Listing and ListingAmenities models
