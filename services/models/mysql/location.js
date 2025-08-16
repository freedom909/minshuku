import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Location extends Model {}

Location.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category: {
      type: DataTypes.ENUM('apartment', 'house', 'room', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    radius: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    units: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'km',
    },
  },
  {
    sequelize,
    modelName: 'Location',
    tableName: 'locations',
    timestamps: false, // no createdAt/updatedAt unless you need them
  }
);

export default Location;
