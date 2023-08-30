'use strict';
const { Model } = require('sequelize');
const { Listing } = require('./listing');
module.exports = (sequelize, DataTypes) => {
  class Amenity extends Model {}

  Amenity.init(
    {
      id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, defaultValue: DataTypes.UUIDV4 },
      category: DataTypes.STRING,
      name: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
      
      },
      updatedAt: {
        type: DataTypes.DATE,
     
      },
    },
    {
      sequelize,
      modelName: 'Amenity',
      timestamps: false,
 
    
    }
  );

  return Amenity;
};
