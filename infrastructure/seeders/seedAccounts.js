import fs from 'fs';
import path from 'path';
import connectToMongoDB from './connectMongo.js'; // Adjust the path as necessary
import Account from '../models/account.js';
import User from '../models/user.js';
import mongoose from 'mongoose';

const seedAccounts = async () => {
  const filePath = path.resolve('seeders/accounts.json');
  const accountsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  try {
    // Establish connection to MongoDB
    await connectToMongoDB();
    console.log('Connected to MongoDB');

    // Clear existing collections
    await User.deleteMany({});
    await Account.deleteMany({});
    console.log('Existing data cleared!');

    for (const account of accountsData) {
      // Create user with generated UUID
      const user = new User({
        _id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
        name: account.name,
        email: account.email,
        password: account.password,
        nickname: account.nickname,
        role: account.role,
        picture: account.picture,
        description: account.description,
      });
      await user.save();

      // Create account with the same email and password, and associate it with the user
      const newAccount = new Account({
        id: account.id,
        email: account.email,
        password: account.password,
        userId: user._id, // Associate account with user
      });
      await newAccount.save();
    }

    console.log('Users and Accounts seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedAccounts();
