import mongoose, { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URL;

connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err.message));

// Define your user schema and model
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: String,
  // Other fields...
});

const User = mongoose.model('User', userSchema);

const users = [
  { email: 'email1@gmail.com', name: 'User One' },
  { email: 'email2@gmail.com', name: 'User Two' },
  // Other user objects...
];

async function seedUsers() {
  for (const user of users) {
    try {
      await User.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
      console.log(`Seeded user: ${user.email}`);
    } catch (err) {
      console.error(`Error seeding user ${user.email}:`, err.message);
    }
  }
  mongoose.connection.close();
}

seedUsers();
