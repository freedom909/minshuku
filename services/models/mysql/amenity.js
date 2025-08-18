// models/mysql/amenity.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Amenity extends Model {}

Amenity.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    locationId: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Amenity',
    tableName: 'amenities',
    timestamps: true,
  }
);

export default Amenity;
