import { Model, DataTypes } from 'sequelize';
import sequelize from './config/seq.js';

class Amenity extends Model {}

Amenity.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  locationId: {
    type: DataTypes.UUID, // match Location.id type
    allowNull: false,
    unique: true, // one-to-one
    references: {
      model: 'Locations',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  category: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
}, {
  sequelize,
  modelName: 'Amenity',
});

export default Amenity;
