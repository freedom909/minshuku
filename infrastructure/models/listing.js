import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js

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
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  checkInDate: DataTypes.DATE,
  checkOutDate: DataTypes.DATE,
  listingStatus: {
    type: DataTypes.ENUM,
    values: ['ACTIVE', 'PENDING', 'SOLD', 'DELETED', 'REJECT', 'CANCELLED', 'EXPIRED'],
  },
}, {
  sequelize,
  modelName: 'Listing',
  timestamps: true,
});

export default Listing;
