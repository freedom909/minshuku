import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js

class Coordinates extends Model {}

Coordinates.init({
  coordinateId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  listingId: {
    type: DataTypes.STRING, 
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Coordinates',
  timestamps: true,
});

export default Coordinates;
