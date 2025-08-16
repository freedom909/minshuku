import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Listing extends Model {}

Listing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    locationId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // each listing tied to exactly one location
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hostId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numOfBeds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pictures: {
      type: DataTypes.JSON, // store array of picture URLs
      allowNull: false,
      defaultValue: ["pic1.jpg", "pic2.jpg"],
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    saleAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bookingNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    listingStatus: {
      type: DataTypes.ENUM(
        'ACTIVE',
        'PENDING',
        'SOLD',
        'DELETED',
        'REJECT',
        'CANCELLED',
        'EXPIRED',
        'COMPLETED',
        'AVAILABLE',
        'PUBLISHED'
      ),
      allowNull: false,
    },
    locationType: {
      type: DataTypes.ENUM('SPACESHIP', 'HOUSE', 'CAMPSITE', 'APARTMENT', 'ROOM'),
      allowNull: false,
      defaultValue: 'ROOM',
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: false, // using explicit createdAt/updatedAt above
  }
);

export default Listing;
