// services/models/user.js

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export const Role = {
  USER: 'USER',
  HOST: 'HOST',
  ADMIN: 'ADMIN',
  GUEST: 'GUEST',
};

export const Provider = {
  EMAIL: 'email',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  TWITTER: 'twitter',
  GITHUB: 'github',
 LOCAL: 'local',
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String },
    password: { type: String },
    name: { type: String },
    fullName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    nickName: { type: String },
    picture: { type: String },

    provider: {
      type: String,
      enum: Object.values(Provider),
      required: true,
    },

    oauthId: { type: String },

    sub: {
      type: String,
      required: function () {
        // 对 email 登录的用户可以自动生成，不强制
        return this.provider !== Provider.EMAIL;
      },
    },

    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
      required: true,
    },

    version: {
      type: Number,
      default: 0,
    },

    kycVerified: { type: Boolean, default: false, required: true },// add this field
  },
  { timestamps: true }
);

// 唯一索引：provider + sub
userSchema.index({ provider: 1, sub: 1 }, { unique: true });

// ⚡ 自动生成 sub（仅 email 用户）
userSchema.pre('validate', function (next) {
  if (this.provider === Provider.EMAIL && !this.sub) {
    this.sub = uuidv4();
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
