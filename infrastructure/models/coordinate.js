import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Ensure this path is correct
import Listing from './listing.js';

class Coordinate extends Model {}

Coordinate.init({
  coordinateId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },

  },
{
  sequelize,
  modelName: 'Coordinate',
  timestamps: true,
});

Listing.Coordinate=Listing.belongsTo(Coordinate)


export default Coordinate;
