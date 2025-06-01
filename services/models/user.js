// services/models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String },
  name: { type: String },
  fullName: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  nickName: { type: String },
  role: { type: String, default: 'GUEST' },
  picture: { type: String },
  provider: { type: String, required: true },
  oauthId: { type: String },
  sub: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: {
    type: Number,
    default: 0
  },  
});

userSchema.index({ provider: 1, sub: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
export default User;