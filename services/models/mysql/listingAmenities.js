import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import Listing from './listing.js';
import Amenity from './amenity.js';

class ListingAmenities extends Model {}

ListingAmenities.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Listing,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    amenityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Amenity,
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'ListingAmenities',
    tableName: 'listing_amenities',
    timestamps: false,
  }
);

// Define associations (many-to-many)
Listing.belongsToMany(Amenity, {
  through: ListingAmenities,
  foreignKey: 'listingId',
  as: 'amenities',
});

Amenity.belongsToMany(Listing, {
  through: ListingAmenities,
  foreignKey: 'amenityId',
  as: 'listings',
});

export default ListingAmenities;
