// Update chikachan1017@gmail.com to PENDING_HOST status
import mongoose from 'mongoose';
import User from '../services/models/user.js';

async function updateUserRole() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/minshuku');
    console.log('✅ Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ email: 'chikachan1017@gmail.com' });
    
    if (!user) {
      console.log('❌ User chikachan1017@gmail.com not found in database');
      return;
    }
    
    console.log('\n📋 Current User Details:');
    console.log('Email:', user.email);
    console.log('Current Role:', user.role);
    console.log('Current Status:', user.status);
    console.log('Provider:', user.provider);
    
    // Update the user role and status
    user.role = 'PENDING_HOST';
    user.status = 'PENDING_HOST_REGISTRATION';
    
    await user.save();
    
    console.log('\n✅ User successfully updated:');
    console.log('New Role:', user.role);
    console.log('New Status:', user.status);
    console.log('Updated at:', user.updatedAt);
    
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateUserRole().then(() => {
  console.log('\n🎉 Update process completed');
}).catch(error => {
  console.error('❌ Update process failed:', error);
});