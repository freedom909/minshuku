// import { DataTypes, Model } from '@sequelize/core';
// import sequelize from './seq.js'; // Adjust path as necessary

// export class User extends Model {}

// User.init({
//   id: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   nickname: {
//     type: DataTypes.STRING,
//     unique: true,
//   },
//   token: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   refresh_token: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   picture: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
//   role: {
//     type: DataTypes.ENUM('ADMIN', 'GUEST', 'HOST'),
//     allowNull: false,
//     defaultValue: 'GUEST',
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: true,
//   },
// }, {
//   sequelize, // Here is where you provide the sequelize instance
//   modelName: 'User',
//   timestamps: true,
// });

// export default User;
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'GUEST', 'HOST'], default: 'GUEST' },
  password: { type: String, required: true },
  token: { type: String },
  refresh_token: { type: String },
  picture: { type: String },
  description: { type: String },
  nickname: { type: String, unique: true }
});

const User = mongoose.model('User', userSchema);

export default User;