// models/mysql/category.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.STRING, // or DataTypes.INTEGER if you want auto increment
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
  }
);

export default Category;
