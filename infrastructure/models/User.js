
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
  nickname: { type: String, unique: true },
  invite_code: {
    type: String,
    required: function() {
      return this.role === 'HOST';
    }
  }
});

const User = mongoose.model('User', userSchema);

export default User;