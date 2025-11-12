// Test becomeHost mutation for specific user mpeg56@gmail.com

async function testBecomeHost() {
  try {
    console.log('🚀 Testing becomeHost mutation for user: mpeg56@gmail.com');
    
    // First, let's find the user ID for mpeg56@gmail.com
    const findUserQuery = `
      query {
        users {
          id
          email
          role
          status
        }
      }
    `;

    console.log('🔍 Searching for user mpeg56@gmail.com...');
    const findResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: findUserQuery
      })
    });

    console.log('Find user response status:', findResponse.status);
    
    if (findResponse.status === 429) {
      console.log('⚠️ Rate limiting detected. Service is returning 429 (Too Many Requests).');
      console.log('The service needs to be restarted to clear rate limiting.');
      return;
    }

    if (!findResponse.ok) {
      console.log('❌ Service not responding properly. Status:', findResponse.status);
      console.log('Response text:', await findResponse.text());
      return;
    }

    const findResult = await findResponse.json();
    console.log('Find user result:', JSON.stringify(findResult, null, 2));

    // Find the specific user
    let targetUserId = null;
    if (findResult.data && findResult.data.users) {
      const targetUser = findResult.data.users.find(user => user.email === 'mpeg56@gmail.com');
      if (targetUser) {
        targetUserId = targetUser.id;
        console.log(`✅ Found user: ${targetUser.email} (ID: ${targetUser.id}, Role: ${targetUser.role}, Status: ${targetUser.status})`);
      } else {
        console.log('❌ User mpeg56@gmail.com not found in database');
        console.log('Available users:', findResult.data.users.map(u => u.email));
        return;
      }
    } else if (findResult.errors) {
      console.log('❌ GraphQL errors:', findResult.errors);
      return;
    }

    if (!targetUserId) {
      console.log('❌ Could not find user ID for mpeg56@gmail.com');
      return;
    }

    // Now test the becomeHost mutation
    console.log('\n📤 Testing becomeHost mutation...');
    
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

    const variables = { userId: targetUserId };

    const mutationResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: becomeHostMutation,
        variables: variables
      })
    });

    console.log('Mutation response status:', mutationResponse.status);
    
    if (!mutationResponse.ok) {
      console.log('❌ Mutation request failed. Status:', mutationResponse.status);
      console.log('Response text:', await mutationResponse.text());
      return;
    }

    const mutationResult = await mutationResponse.json();
    console.log('\n📤 BecomeHost Mutation Response:');
    console.log(JSON.stringify(mutationResult, null, 2));

    if (mutationResult.errors) {
      console.error('❌ GraphQL Errors:', mutationResult.errors);
    } else if (mutationResult.data && mutationResult.data.becomeHost) {
      const { code, success, message, user } = mutationResult.data.becomeHost;
      console.log(`✅ Mutation successful!`);
      console.log(`   Code: ${code}, Success: ${success}`);
      console.log(`   Message: ${message}`);
      console.log(`   User: ${user.email} (${user.role}, ${user.status})`);
      
      // Verify the change
      console.log('\n🔍 Verifying user status after mutation...');
      const verifyResponse = await fetch('http://localhost:4010/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query { getUser(id: "${targetUserId}") { id email role status } }`
        })
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log('Verification result:', JSON.stringify(verifyResult, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error testing becomeHost:', error);
  }
}

// Run the test
testBecomeHost().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});