'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ListingAmenities extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ListingAmenities.init(
    {
      ListingId: {
        type: DataTypes.STRING,
        references: {
          model: 'Listings',
          key: 'id',
        },
      },
      AmenityId: {
        type: DataTypes.STRING,
        references: {
          model: 'Amenities',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'ListingAmenities',
      timestamps: false,
    }

  );
  return ListingAmenities;
};