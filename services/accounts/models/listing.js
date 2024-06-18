// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const listingSchema = new Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   price: { type: Number, required: true },
//   locationId: { type: Number, required: true },
//   hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   latitude: { type: Number, required: true },
//   longitude: { type: Number, required: true },
//   userId: { type: String, required: true },
//   location: { type: String},
// });

// const Listing = mongoose.model('Listing', listingSchema);

// export default Listing;


import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Review'},
}, { timestamps: true });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;

// import { DataTypes, Model } from '@sequelize/core';
// import sequelize from './seq.js';

// export class Listing extends Model {}

// Listing.init({
//   id: {
//     type: DataTypes.STRING,
//     primaryKey: true,
//   },
//   title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//   },
//   costPerNight: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   hostId: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   locationType: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   numOfBeds: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   photoThumbnail: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   isFeatured: {
//     type: DataTypes.BOOLEAN,
//     allowNull: true,
//   },
//   latitude: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   longitude: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
// }, {
//   sequelize,
//   modelName: 'Listing',
//   timestamps: true,
// });

// Listing.associate = (models) => {
//   Listing.hasMany(models.ReviewGuest, { foreignKey: 'listingId', as: 'guestReviews' });
//   Listing.hasMany(models.ReviewHost, { foreignKey: 'listingId', as: 'hostReviews' });
//   Listing.belongsToMany(Amenity, { through: ListingAmenities, foreignKey: 'listingId', as: 'amenities' });

// };

// export default Listing;

