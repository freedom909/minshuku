import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Adjust the path as necessary

class Coordinate extends Model {}

Coordinate.init({
  coordinateId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Listings', // Ensure this matches the table name
      key: 'id'
    }
  },
}, {
  sequelize,
  modelName: 'Coordinate',
  timestamps: true,
});

// Export the model
export default Coordinate;
