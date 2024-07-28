// import mongoose from 'mongoose';
// import { FLOAT } from 'sequelize';

// const reviewSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   rating: { type: FLOAT, required: true },
//   content: { type: String, required: true },
//   locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
//   hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
// }, { timestamps: true });

// const Review = mongoose.model('Review', reviewSchema);

// export default Review;

import { DataTypes, Model } from 'sequelize';
import sequelize from './seq.js';

export class Review extends Model {}

Review.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Review',
  timestamps: true,
});

export default Review;


