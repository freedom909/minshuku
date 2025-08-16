import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Amenity extends Model {}

Amenity.init(
  {
    id: {
      type: DataTypes.INTEGER, // Auto-increment ID
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // avoid duplicate "Wifi" rows
    },
    category: {
      type: DataTypes.ENUM('wifi', 'parking', 'pool', 'gym', 'kitchen'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING, // optional icon/image for UI
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Amenity',
    tableName: 'amenities',
    timestamps: false,
  }
);

export default Amenity;
