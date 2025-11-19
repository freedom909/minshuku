import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import Listing from './listing.js';
import Amenity from './amenity.js';

class ListingAmenities extends Model {}

ListingAmenities.init(
  {
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Listing,
        key: 'id',
      },
      primaryKey: true,
      // Align with actual DB column names (camelCase)
    },
    amenityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Amenity,
        key: 'id',
      },
      primaryKey: true,
      // Align with actual DB column names (camelCase)
    },
  },
  {
    sequelize,
    modelName: 'ListingAmenities',
    tableName: 'listing_amenities',
    timestamps: false,
  }
);

// ---- Correct Associations ----
Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: "listingId" });
Amenity.belongsToMany(Listing, { through: ListingAmenities, foreignKey: "amenityId" });


export default ListingAmenities;
