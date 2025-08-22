import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Category extends Model {}

Category.init({
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  description: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  image: { 
    type: DataTypes.STRING, 
    allowNull: true, 
    defaultValue: 'icon' 
  },
}, 
{
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: false, // no createdAt/updatedAt
});

export default Category;
