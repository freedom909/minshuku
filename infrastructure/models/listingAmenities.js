import { DataTypes, Model } from '@sequelize/core';
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
}, {
  sequelize,
  modelName: 'ListingAmenities',
  timestamps: false,
});

export default ListingAmenities;
