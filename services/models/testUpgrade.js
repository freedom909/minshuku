import mongoose from 'mongoose';
import User, { Role } from './user.js';

const MONGO_URI = 'mongodb://localhost:27017/minshuku';

async function upgradeToHost(email) {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`⚠️ User with email ${email} not found`);
      process.exit(1);
    }

    console.log('Before upgrade:', {
      email: user.email,
      sub: user.sub,
      role: user.role,
      kycVerified: user.kycVerified,
    });

    // 升级为 HOST
    user.role = Role.HOST;
    user.kycVerified = true;
    await user.save();

    console.log('After upgrade:', {
      email: user.email,
      sub: user.sub,
      role: user.role,
      kycVerified: user.kycVerified,
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error upgrading user:', err);
    process.exit(1);
  }
}

// 调用升级函数
upgradeToHost('guest1@example.com');
