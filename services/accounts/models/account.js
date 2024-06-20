import mongoose from 'mongoose';

const { Schema } = mongoose;

const accountSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  email: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
