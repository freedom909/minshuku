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
<<<<<<< HEAD
  listingStatus: {
    type: DataTypes.ENUM,
    values: ['ACTIVE', 'PENDING', 'SOLD', 'DELETED', 'REJECT', 'CANCELLED', 'EXPIRED'],
  },
=======
>>>>>>> 423c9ada222eec0adc48468d9b684fd46ad7492d
}, {
  sequelize,
  modelName: 'Listing',
  timestamps: true,
});

export default Listing;
