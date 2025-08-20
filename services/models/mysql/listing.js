// models/mysql/listing.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Listing extends Model {}

Listing.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING },
    pictures: { type: DataTypes.JSON }, // array of URLs
    numOfBeds: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    saleAmount: { type: DataTypes.FLOAT },
    checkInDate: { type: DataTypes.DATEONLY },
    checkOutDate: { type: DataTypes.DATEONLY },

    locationId: { type: DataTypes.STRING, allowNull: false },
    hostId: { type: DataTypes.STRING, allowNull: false }, // one-to-many with User
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: true,
  }
);

export default Listing;
