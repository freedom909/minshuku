import mongoose from 'mongoose';
import User, { Role, Provider } from '../user.js';

const MONGO_URI = 'mongodb://localhost:27017/minshuku'; // 修改为你的数据库

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // 清空旧数据
    await User.deleteMany({});

    // 插入测试用户
    await User.insertMany([
      {
        email: 'guest1@example.com',
        fullName: 'Guest One',
        role: Role.USER,
        kycVerified: false,
        provider: Provider.EMAIL, // 自动生成 sub
      },
      {
        email: 'host1@example.com',
        fullName: 'Host One',
        role: Role.HOST,
        kycVerified: true,
        provider: Provider.GOOGLE,
        sub: 'host1_google_sub', // OAuth 用户必须写 sub
      },
      {
        email: 'unverified@example.com',
        fullName: 'Unverified User',
        role: Role.USER,
        kycVerified: false,
        provider: Provider.APPLE,
        sub: 'unverified_apple_sub', // OAuth 用户必须写 sub
      },
    ]);

    console.log('✅ Seed data inserted');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seed();
