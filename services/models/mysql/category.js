import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Category extends Model {}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    image: DataTypes.STRING,
    description: DataTypes.STRING,
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'listings', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false,
  }
);

export default Category;
