import mongoose from '../mongoose.mjs';  // Adjust the path if necessary

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'GUEST', 'HOST'], default: 'GUEST' },
  password: { type: String, required: true },
  token: { type: String, required: false },
  refresh_token: { type: String, required: false },
  picture: { type: String, required: false },
  description: { type: String, required: false },
  nickname: { type: String, unique: true, required: false }
});

const User = mongoose.model('User', userSchema);

export default User;
