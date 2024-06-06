// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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

const User = mongoose.model('User', userSchema);

module.exports = User;
