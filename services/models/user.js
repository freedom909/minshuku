// services/models/user.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  version: {
    type: Number,
    default: 0
  },
  fullName: { 
    type: String, 
    required: true,
    trim: true
  },
  nickname: { 
    type: String,
    trim: true 
  },
  picture: { 
    type: String,
    trim: true
  },
  password: { 
    type: String,
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Never return password in queries
  },
  role: { 
    type: String, 
    enum: ['ADMIN', 'HOST', 'GUEST'], 
    default: 'GUEST',
    required: true
  },
  provider: { 
    type: String, 
    enum: ['GOOGLE', 'FACEBOOK', 'APPLE', 'LOCAL'] 
  },
  oauthId: { 
    type: String,
    unique: true,
    sparse: true // Allow null for non-OAuth users
  },
  accessToken: { 
    type: String,
    select: false 
  },
  refreshToken: { 
    type: String,
    select: false 
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.accessToken;
      delete ret.refreshToken;
      return ret;
    }
  }
});

// Unique index on oauthId only when it's a string (i.e., for OAuth users)
userSchema.index(
  { oauthId: 1 },
  {
    unique: true,
    partialFilterExpression: { oauthId: { $type: 'string' } }
  }
);

const User = mongoose.model('User', userSchema);

export default User;