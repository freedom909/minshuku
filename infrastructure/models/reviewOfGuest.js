import { DataTypes, Model } from '@sequelize/core';
import sequelize from './seq.js';

class ReviewOfGuest extends Model {}

ReviewOfGuest.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  guestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'ReviewOfGuest',
  timestamps: true,
});

export default ReviewOfGuest;
