// Fixed test for becomeHost mutation with correct schema fields

async function createTestUser() {
  try {
    console.log('👤 Creating test user...');
    
    const signUpMutation = `
      mutation SignUp($input: SignUpInput!) {
        signUp(input: $input) {
          code
          success
          message
          userId
          role
        }
      }
    `;

    const signUpVariables = {
      input: {
        email: 'mpeg56@gmail.com',
        password: 'testpassword123',
        name: 'Test User MPEG56',
        nickname: 'mpeg56',
        role: 'GUEST',
        picture: 'https://example.com/photo.jpg'
      }
    };

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: signUpMutation,
        variables: signUpVariables
      })
    });

    console.log('SignUp response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('SignUp result:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.log('❌ SignUp errors:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
        });
        return null;
      }
      
      if (result.data && result.data.signUp) {
        const { userId, role } = result.data.signUp;
        console.log(`✅ User created: mpeg56@gmail.com (ID: ${userId}, Role: ${role})`);
        return userId;
      }
    } else {
      console.log('❌ HTTP error:', response.status);
      console.log('Response text:', await response.text());
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return null;
  }
}

async function testBecomeHost(userId, email) {
  try {
    console.log(`\n🚀 Testing becomeHost mutation for user: ${email} (ID: ${userId})`);
    
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

    console.log('Mutation response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n📤 BecomeHost Mutation Response:');
      console.log(JSON.stringify(result, null, 2));

      if (result.errors) {
        console.log('\n🔧 Error Analysis:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
          if (error.extensions && error.extensions.code) {
            console.log(`  Error Code: ${error.extensions.code}`);
          }
        });
      } else if (result.data && result.data.becomeHost) {
        const { code, success, message, user } = result.data.becomeHost;
        console.log(`\n✅ MUTATION SUCCESSFUL!`);
        console.log(`   Code: ${code}`);
        console.log(`   Success: ${success}`);
        console.log(`   Message: ${message}`);
        console.log(`   User Status: ${user.email} (Role: ${user.role}, Status: ${user.status})`);
        
        // Verify the user was actually updated
        if (user.role === 'PENDING_HOST' && user.status === 'PENDING_HOST_REGISTRATION') {
          console.log(`\n🎉 SUCCESS: User successfully transitioned to PENDING_HOST status!`);
          console.log(`   Previous: GUEST/ACTIVE`);
          console.log(`   Current: ${user.role}/${user.status}`);
        }
      }
    } else {
      console.log('❌ HTTP error:', response.status);
      console.log('Response text:', await response.text());
    }

  } catch (error) {
    console.error('❌ Error testing becomeHost:', error);
  }
}

async function main() {
  console.log('🚀 Starting becomeHost test with fixed schema...');
  console.log('================================================');
  
  // Step 1: Create test user
  const userId = await createTestUser();
  
  if (userId) {
    // Step 2: Test becomeHost mutation
    await testBecomeHost(userId, 'mpeg56@gmail.com');
  } else {
    console.log('❌ Could not create test user. The becomeHost mutation cannot be tested.');
  }
}

// Run the test
main().then(() => {
  console.log('\n✅ Test sequence completed');
}).catch(error => {
  console.error('❌ Test sequence failed:', error);
});