'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coordinates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
 Coordinates.init({
    // id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    latitude: {type:DataTypes.FLOAT,allowNull: false},
    longitude: {type:DataTypes.FLOAT,allowNull: false},
  }, {
    sequelize,
    modelName: 'Coordinates',
    timestamps:false 


  });
  return Coordinates;
};