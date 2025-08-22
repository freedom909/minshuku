import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import Listing from './listing.js';

class ListingCategories extends Model {}

ListingCategories.init(
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
    timestamps: true,
  }
);

export default ListingCategories;
