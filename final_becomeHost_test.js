// Final test for becomeHost mutation with proper user lookup

async function findUserByEmail(email) {
  try {
    console.log(`🔍 Searching for user: ${email}`);
    
    // Try to find user by querying all users
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

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: findUserQuery
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.data && result.data.users) {
        const targetUser = result.data.users.find(user => user.email === email);
        if (targetUser) {
          console.log(`✅ Found user: ${targetUser.email} (ID: ${targetUser.id})`);
          return targetUser;
        } else {
          console.log(`❌ User ${email} not found in query results`);
          console.log('Available users:', result.data.users.map(u => u.email));
        }
      } else if (result.errors) {
        console.log('❌ GraphQL errors when querying users:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
        });
      }
    } else {
      console.log(`❌ HTTP error: ${response.status}`);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error finding user:', error);
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
  const targetEmail = 'mpeg56@gmail.com';
  
  console.log('🚀 Starting becomeHost mutation test...');
  console.log('========================================');
  
  // Step 1: Find the user
  const user = await findUserByEmail(targetEmail);
  
  if (user) {
    // Step 2: Test the mutation
    await testBecomeHost(user.id, targetEmail);
  } else {
    console.log(`\n💡 User ${targetEmail} not found. Possible solutions:`);
    console.log('1. Check if the user exists in the database');
    console.log('2. Create the user first using the signUp mutation');
    console.log('3. Use a different existing user email');
    
    // Try with a known test user pattern
    console.log('\n🔍 Trying common test user patterns...');
    const testEmails = ['test@example.com', 'user@example.com', 'guest@example.com'];
    
    for (const testEmail of testEmails) {
      const testUser = await findUserByEmail(testEmail);
      if (testUser) {
        console.log(`\n🎯 Found alternative user: ${testEmail}`);
        await testBecomeHost(testUser.id, testEmail);
        break;
      }
    }
  }
}

// Run the test
main().then(() => {
  console.log('\n✅ Test sequence completed');
}).catch(error => {
  console.error('❌ Test sequence failed:', error);
});