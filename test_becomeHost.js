import mongoose from 'mongoose';
import User from './services/models/user.js';

const MONGO_URI = 'mongodb://localhost:27017/air';

async function testBecomeHost() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    // Find a test user (preferably a GUEST or USER)
    const testUser = await User.findOne({ 
      $or: [
        { role: 'GUEST' },
        { role: 'USER' },
        { role: { $exists: false } }
      ]
    });

    if (!testUser) {
      console.log('⚠️ No suitable test user found. Creating a test user...');
      
      // Create a test user
      const newUser = new User({
        email: 'testuser@example.com',
        name: 'Test User',
        role: 'GUEST',
        status: 'ACTIVE',
        provider: 'email',
        sub: 'test-user-id-' + Date.now()
      });
      
      await newUser.save();
      console.log('✅ Created test user:', {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status
      });
      
      return newUser._id.toString();
    }

    console.log('✅ Found test user:', {
      id: testUser._id,
      email: testUser.email,
      role: testUser.role,
      status: testUser.status
    });

    return testUser._id.toString();
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

async function testMutation(userId) {
  try {
    const mutation = `
      mutation BecomeHost($userId: ID!) {
        becomeHost(userId: $userId) {
          code
          success
          message
          user {
            id
            role
            status
          }
        }
      }
    `;

    const variables = { userId };

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();
    console.log('\n📤 Mutation Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
    }

    return result;
  } catch (error) {
    console.error('❌ Error testing mutation:', error);
    throw error;
  }
}

async function main() {
  try {
    const userId = await testBecomeHost();
    
    if (userId) {
      console.log('\n🚀 Testing becomeHost mutation...');
      await testMutation(userId);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Test completed');
  }
}

main();