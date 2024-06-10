import mongoose from 'mongoose';
import dotenv from 'dotenv';
import usersData from './users.json' assert { type: 'json' };
import bookingData from './bookings.json' assert { type: 'json' };
import listingsData from './listings.json' assert { type: 'json' };
import User from '../models/user.js';

dotenv.config();

async function main() {
  console.log('Start seeding ...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const existingNicknames = new Set();
    for (const u of usersData) {
      if (u.nickname) {
        if (existingNicknames.has(u.nickname)) {
          console.error(`Duplicate nickname found: ${u.nickname}. Skipping user creation.`);
          continue;
        }
        existingNicknames.add(u.nickname);
      }
      
      const user = new User(u);
      await user.save();
      console.log(`Created user with id: ${user._id}`);
    }
    
    console.log('Seeding finished.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
  }
}

main();
