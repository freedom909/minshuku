// models/user.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nickname: { type: String },
  picture: { type: String },
  password: { type: String }, // for email/password login
  role: { type: String, enum: ['ADMIN', 'HOST', 'GUEST'], default: 'GUEST' },
  provider: { type: String, enum: ['GOOGLE', 'FACEBOOK', 'APPLE'] },
  oauthId: { type: String, unique: true }, // replaces providerId
}, {
  timestamps: true
});

// Replace the old index with one for oauthId
userSchema.index({ oauthId: 1 }, { unique: true, partialFilterExpression: { oauthId: { $type: "string" } } });

const User = mongoose.model('User', userSchema);

export default User;
