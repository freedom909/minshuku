import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js
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
}, {
  sequelize,
  modelName: 'Coordinate',
  timestamps: true,
});
Coordinate.belongsTo(Listing, { foreignKey: 'listingId', constraints:false });
Listing.hasOne(Coordinate, { foreignKey: 'listingId', constraints:false });
export default Coordinate;
