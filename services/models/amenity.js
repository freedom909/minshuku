
import { Model, DataTypes } from 'sequelize';
import sequelize from './seq.js';

class Amenity extends Model { }

Amenity.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Amenity',
});

// Define associations if needed later

// Amenity.associate = (models) => {
//   Amenity.belongsToMany(models.Listing, {
//     through: 'ListingAmenities',
//     foreignKey: 'amenityId',
//     otherKey: 'listingId',
//     as: 'listings'
//   });
// };

export default Amenity;
