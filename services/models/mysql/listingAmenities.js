import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';
import { v4 as uuidv4 } from 'uuid';

class ListingAmenities extends Model {}

ListingAmenities.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: uuidv4 },
    listingId: { type: DataTypes.STRING, allowNull: false },
    amenityId: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'ListingAmenities',
    tableName: 'listing_amenities',
    timestamps: false,
  }
);

export default ListingAmenities;
