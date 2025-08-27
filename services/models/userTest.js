import mongoose from 'mongoose';
import User from './user.js';

const MONGO_URI = 'mongodb://localhost:27017/minshuku'; // 修改为你的数据库

async function testUsers() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const users = await User.find({});
    if (users.length === 0) {
      console.log('⚠️ No users found');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(u => {
        console.log(`- email: ${u.email}, sub: ${u.sub}, role: ${u.role}, kycVerified: ${u.kycVerified}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    process.exit(1);
  }
}

testUsers();
