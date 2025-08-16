import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import Listing from './listing.js';
import Location from './location.js';
import Category from './category.js';

class Category extends Model {}

Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
 image: DataTypes.STRING,
  description: DataTypes.STRING,
  amenityType: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  amenityValue: DataTypes.INTEGER,
  listingId: {
    type: DataTypes.INTEGER, 

    allowNull: true,
    references: {
      model: 'listings', // 👈 match your actual table name
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
  locationId: {
    type: DataTypes.INTEGER, 

    allowNull: true,
    references: {
      model: 'locations', // 👈 match your actual table name
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
},
 {
  sequelize,
  modelName: 'Category',
  tableName: 'categories', // 👈 make table name explicit
  timestamps: false, // disable if your table doesn’t have createdAt/updatedAt
});


Category.belongsTo(Listing, { foreignKey: 'listingId' });
Listing.hasOne(Category, { foreignKey: 'listingId' });

Category.belongsTo(Location, { foreignKey: 'locationId' });
Location.hasOne(Category, { foreignKey: 'locationId' });

export default Category;
