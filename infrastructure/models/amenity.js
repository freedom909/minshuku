import { DataTypes, Model } from '@sequelize/core';
import sequelize from './seq.js';

class Amenity extends Model {}
Amenity.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Amenity',
  timestamps: false,
});

export default Amenity;
