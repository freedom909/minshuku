// Direct MongoDB update for chikachan1017@gmail.com

import { MongoClient } from 'mongodb';

async function updateUserRole() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const database = client.db('minshuku');
    const users = database.collection('users');
    
    // Find the user
    const user = await users.findOne({ email: 'chikachan1017@gmail.com' });
    
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
    const result = await users.updateOne(
      { email: 'chikachan1017@gmail.com' },
      { 
        $set: { 
          role: 'PENDING_HOST',
          status: 'PENDING_HOST_REGISTRATION',
          updatedAt: new Date()
        }
      }
    );
    
    console.log('\n✅ Update result:');
    console.log('Matched count:', result.matchedCount);
    console.log('Modified count:', result.modifiedCount);
    
    if (result.modifiedCount > 0) {
      console.log('🎉 User successfully updated to PENDING_HOST status!');
      
      // Verify the update
      const updatedUser = await users.findOne({ email: 'chikachan1017@gmail.com' });
      console.log('\n✅ Verified update:');
      console.log('New Role:', updatedUser.role);
      console.log('New Status:', updatedUser.status);
    } else {
      console.log('⚠️ User was not modified (might already have the target role)');
    }
    
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the update
updateUserRole().then(() => {
  console.log('\n🎉 Update process completed');
}).catch(error => {
  console.error('❌ Update process failed:', error);
});