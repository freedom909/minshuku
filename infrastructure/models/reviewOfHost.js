import { DataTypes, Model } from '@sequelize/core';
import sequelize from './seq.js';
import ReviewOfGuest from './reviewOfGuest.js';

class ReviewOfHost extends Model {}

ReviewOfHost.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  hostId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reviewOfGuestId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: ReviewOfGuest,
      key: 'id',
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'ReviewOfHost',
  timestamps: true,
});

export default ReviewOfHost;
