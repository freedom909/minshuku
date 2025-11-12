// Direct test for becomeHost mutation - bypass MongoDB connection issues

async function testBecomeHost() {
  try {
    console.log('🚀 Testing becomeHost mutation for user mpeg56@gmail.com');
    
    // First, let's test if the GraphQL service is responding
    console.log('🔍 Testing GraphQL service connectivity...');
    
    const testQuery = `
      query {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const testResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery
      })
    });

    console.log('Service response status:', testResponse.status);
    
    if (testResponse.status === 429) {
      console.log('⚠️ Rate limiting detected (429). Service needs to be restarted.');
      console.log('Please restart the subgraph-users service to clear rate limiting.');
      return;
    }

    if (!testResponse.ok) {
      console.log('❌ Service not responding properly. Status:', testResponse.status);
      console.log('Response text:', await testResponse.text());
      console.log('\n💡 Troubleshooting steps:');
      console.log('1. Make sure subgraph-users service is running on port 4010');
      console.log('2. Check if MongoDB is running on port 27017');
      console.log('3. Restart the subgraph-users service to clear rate limiting');
      return;
    }

    // Service is responding, now test the becomeHost mutation
    console.log('✅ GraphQL service is responding');
    
    // Since we can't query MongoDB directly, let's try to find the user via GraphQL
    console.log('\n🔍 Searching for user mpeg56@gmail.com via GraphQL...');
    
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

    const findResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: findUserQuery
      })
    });

    if (findResponse.ok) {
      const findResult = await findResponse.json();
      console.log('Find user result:', JSON.stringify(findResult, null, 2));
      
      if (findResult.data && findResult.data.users) {
        const targetUser = findResult.data.users.find(user => user.email === 'mpeg56@gmail.com');
        if (targetUser) {
          console.log(`✅ Found user: ${targetUser.email} (ID: ${targetUser.id})`);
          
          // Test the becomeHost mutation
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

          const variables = { userId: targetUser.id };

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
          
          if (mutationResponse.ok) {
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
            }
          } else {
            console.log('❌ Mutation request failed. Status:', mutationResponse.status);
            console.log('Response text:', await mutationResponse.text());
          }
        } else {
          console.log('❌ User mpeg56@gmail.com not found via GraphQL query');
          console.log('Available users:', findResult.data.users.map(u => u.email));
        }
      }
    } else {
      console.log('❌ Could not query users. Status:', findResponse.status);
    }

  } catch (error) {
    console.error('❌ Error testing becomeHost:', error);
    console.log('\n💡 This error suggests:');
    console.log('1. The GraphQL service is not running on port 4010');
    console.log('2. There might be a network/firewall issue');
    console.log('3. The service might need to be restarted');
  }
}

// Run the test
testBecomeHost().then(() => {
  console.log('\n✅ Test completed');
}).catch(error => {
  console.error('❌ Test failed:', error);
});