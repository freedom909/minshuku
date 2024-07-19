import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js'; // Correct path to seq.js

class Coordinates extends Model {}

Coordinates.init({
  coordinateId: {
    type: DataTypes.STRING,
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
  modelName: 'Coordinates',
  timestamps: true,
});

export default Coordinates;
