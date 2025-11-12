import mongoose from "mongoose";
const { Schema } = mongoose;

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  username: String
});

const privacySettingsSchema = new mongoose.Schema({
  profileVisibility: {
    type: String,
    enum: ['PUBLIC', 'NETWORK_ONLY', 'PRIVATE'],
    default: 'PUBLIC'
  },
  emailVisibility: {
    type: String,
    enum: ['PUBLIC', 'NETWORK_ONLY', 'PRIVATE'],
    default: 'NETWORK_ONLY'
  },
  networkVisibility: {
    type: String,
    enum: ['PUBLIC', 'NETWORK_ONLY', 'PRIVATE'],
    default: 'PUBLIC'
  },
  activityVisibility: {
    type: String,
    enum: ['PUBLIC', 'NETWORK_ONLY', 'PRIVATE'],
    default: 'PUBLIC'
  }
});

const notificationPreferencesSchema = new mongoose.Schema({
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  networkInvitations: {
    type: Boolean,
    default: true
  },
  bookingUpdates: {
    type: Boolean,
    default: true
  },
  reviewNotifications: {
    type: Boolean,
    default: true
  }
});

const profileSchema = new mongoose.Schema({
  accountId: {
    type: String,
    required: true,
    unique: true
  },
  fullname: {
    type: String,
    trim: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']
  },
  phoneNumber: String,
  email: {
    type: String,
    required: true
  },
  location: String,
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  interests: [String],
  skills: [String],
  socialLinks: [socialLinkSchema],
  network: [String],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'VERIFIED'],
    default: 'ACTIVE'
  },
  role: {
    type: String,
    enum: ['HOST', 'GUEST', 'ADMIN', 'USER'],
    default: 'USER'
  },
  privacySettings: privacySettingsSchema,
  notificationPreferences: notificationPreferencesSchema,
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
});

// Add text index for searching
profileSchema.index({ 
  fullname: "text",
  username: "text", 
  bio: "text",
  interests: "text",
  skills: "text"
});

// Add compound indexes for better query performance
profileSchema.index({ status: 1, createdAt: -1 });
profileSchema.index({ role: 1, createdAt: -1 });
profileSchema.index({ accountId: 1 });

// Update the updatedAt field before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
