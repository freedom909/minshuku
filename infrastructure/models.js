// models/User.js

import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['ADMIN', 'GUEST', 'HOST'],
    default: 'GUEST',
  },
  password: {
    type: String,
    required: true,
  },
  token: String,
  refresh_token: String,
  picture: String,
  description: String,
  nickname: {
    type: String,
    unique: true,
  },
});

const User = model('User', userSchema);

export default User;
