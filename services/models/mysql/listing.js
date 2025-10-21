// models/mysql/listing.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Listing extends Model {}

Listing.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    pictures: { type: DataTypes.JSON }, // array of URLs
    numOfBeds: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    saleAmount: { type: DataTypes.FLOAT },
    checkInDate: { type: DataTypes.DATEONLY },
    checkOutDate: { type: DataTypes.DATEONLY },
    hostId: { type: DataTypes.STRING, allowNull: false }, 
    listingStatus: { type: DataTypes.ENUM('available', 'pending', 'sold', 'archived'), allowNull: false },
    locationType: { type: DataTypes.ENUM('ROOM', 'APARTMENT', 'HOUSE', 'COTTAGE', 'VILLA', 'OTHER'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Listing;
