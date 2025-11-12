// Simple test for becomeHost mutation using fetch API

async function testBecomeHost() {
  try {
    // First, let's try to get a list of users to find a test user ID
    const usersQuery = `
      query {
        users {
          id
          email
          role
          status
        }
      }
    `;

    console.log('🔍 Fetching users...');
    const usersResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: usersQuery
      })
    });

    const usersResult = await usersResponse.json();
    console.log('Users response:', JSON.stringify(usersResult, null, 2));

    let testUserId = null;
    
    if (usersResult.data && usersResult.data.users && usersResult.data.users.length > 0) {
      // Find a user that's not already a host
      const testUser = usersResult.data.users.find(user => 
        user.role !== 'HOST' && user.role !== 'PENDING_HOST'
      );
      
      if (testUser) {
        testUserId = testUser.id;
        console.log(`✅ Found test user: ${testUser.email} (${testUser.role})`);
      }
    }

    if (!testUserId) {
      // If no suitable user found, try to create one via signUp mutation
      console.log('⚠️ No suitable user found. Trying to create a test user...');
      
      const signUpMutation = `
        mutation SignUp($input: SignUpInput!) {
          signUp(input: $input) {
            code
            success
            message
            userId
          }
        }
      `;

      const signUpVariables = {
        input: {
          email: `testuser-${Date.now()}@example.com`,
          password: 'testpassword123',
          name: 'Test User',
          nickname: 'testuser',
          role: 'GUEST',
          picture: 'https://example.com/photo.jpg'
        }
      };

      const signUpResponse = await fetch('http://localhost:4010/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: signUpMutation,
          variables: signUpVariables
        })
      });

      const signUpResult = await signUpResponse.json();
      console.log('SignUp response:', JSON.stringify(signUpResult, null, 2));

      if (signUpResult.data && signUpResult.data.signUp && signUpResult.data.signUp.userId) {
        testUserId = signUpResult.data.signUp.userId;
        console.log(`✅ Created test user with ID: ${testUserId}`);
      }
    }

    if (!testUserId) {
      console.log('❌ Could not find or create a test user');
      return;
    }

    // Now test the becomeHost mutation
    console.log('\n🚀 Testing becomeHost mutation...');
    
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

    const variables = { userId: testUserId };

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

    const result = await response.json();
    console.log('\n📤 BecomeHost Mutation Response:');
    console.log(JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
    } else if (result.data && result.data.becomeHost) {
      const { code, success, message, user } = result.data.becomeHost;
      console.log(`✅ Mutation successful!`);
      console.log(`   Code: ${code}, Success: ${success}`);
      console.log(`   Message: ${message}`);
      console.log(`   User: ${user.email} (${user.role}, ${user.status})`);
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