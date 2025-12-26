// Test becomeHost mutation from subgraph-users directory
import mongoose from 'mongoose';
import User from '../services/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/air';

async function testBecomeHost() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Find the specific user mpeg56@gmail.com
    const user = await User.findOne({ email: 'mpeg56@gmail.com' });
    
    if (!user) {
      console.log('❌ User mpeg56@gmail.com not found in database');
      
      // List all users to see what's available
      const allUsers = await User.find({}).select('email role status').limit(10);
      console.log('Available users:');
      allUsers.forEach(u => {
        console.log(`- ${u.email} (${u.role}, ${u.status})`);
      });
      
      return;
    }

    console.log('✅ Found user:', {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      provider: user.provider
    });

    // Test the becomeHost mutation via HTTP
    const userId = user._id.toString();
    
    console.log('\n🚀 Testing becomeHost mutation via HTTP...');
    
    const becomeHostMutation = `
      mutation BecomeHost($userId: ID!) {
        becomeHost(userId: $userId) {
          code
          success
          message
          user {
            id
            email
            role
            status
          }
        }
      }
    `;

    const variables = { userId: userId };

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: becomeHostMutation,
        variables: variables
      })
    });

    console.log('Response status:', response.status);
    
    if (response.status === 429) {
      console.log('⚠️ Rate limiting detected. Service needs to be restarted.');
      return;
    }

    if (!response.ok) {
      console.log('❌ HTTP error:', response.status);
      console.log('Response text:', await response.text());
      return;
    }

    const result = await response.json();
    console.log('\n📤 Mutation Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
    } else if (result.data && result.data.becomeHost) {
      const { code, success, message, user: updatedUser } = result.data.becomeHost;
      console.log(`✅ Mutation successful!`);
      console.log(`   Code: ${code}, Success: ${success}`);
      console.log(`   Message: ${message}`);
      console.log(`   User: ${updatedUser.email} (${updatedUser.role}, ${updatedUser.status})`);
    }

  } catch (error) {
    console.error('❌ Error testing becomeHost:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the test
testBecomeHost().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});