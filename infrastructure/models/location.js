// import mongoose from 'mongoose';

// const locationSchema = new mongoose.Schema({
//   address: { type: String, required: true },
//   city: { type: String, required: true },
//   state: { type: String, required: true },
//   country: { type: String, required: true },
//   zipCode: { type: String, required: true },
// }, { timestamps: true });

// const Location = mongoose.model('Location', locationSchema);

// export default Location;

import { Sequelize, DataTypes, Model } from '@sequelize/core';
import { Attribute, PrimaryKey, AutoIncrement, NotNull } from '@sequelize/core/decorators-legacy';


export class Location extends Model {}

Location.init({
  id: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.STRING,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})
export default Location
