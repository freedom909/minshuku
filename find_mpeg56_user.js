// Find the user mpeg56@gmail.com in the database
import mongoose from 'mongoose';
import User from './services/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/air';

async function findUser() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Find the specific user
    const user = await User.findOne({ email: 'mpeg56@gmail.com' });
    
    if (!user) {
      console.log('❌ User mpeg56@gmail.com not found in database');
      
      // List all users to see what's available
      const allUsers = await User.find({}).select('email role status').limit(10);
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.email} (${u.role}, ${u.status})`);
      });
      
      return null;
    }

    console.log('✅ Found user:', {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      provider: user.provider
    });

    return user._id.toString();
  } catch (error) {
    console.error('❌ Error finding user:', error);
    return null;
  } finally {
    await mongoose.connection.close();
  }
}

// Run the function
findUser().then(userId => {
  if (userId) {
    console.log('\n📋 User ID to use for testing:', userId);
    console.log('\n🚀 You can now test the becomeHost mutation with this user ID.');
  }
}).catch(error => {
  console.error('❌ Error:', error);
});