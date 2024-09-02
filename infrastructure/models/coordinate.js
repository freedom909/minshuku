import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js

class Coordinate extends Model {}

Coordinate.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  latitude:{
    type: DataTypes.FLOAT,
    allowNull: false,
  } ,
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  } ,
  listingId: {
    type: DataTypes.STRING, 
  },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Coordinate',
  timestamps: true,
});

export default Coordinate;