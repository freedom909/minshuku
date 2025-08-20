import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import Listing from './listing.js';
import Category from './category.js';

class ListingCategory extends Model {}

ListingCategory.init(
  {
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Listing,
        key: 'id',
      },
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'ListingCategory',
    tableName: 'listing_categories',
    timestamps: false,
  }
);

export default ListingCategory;
