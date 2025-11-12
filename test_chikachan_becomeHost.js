// Test becomeHost mutation for existing user chikachan1017@gmail.com

async function findUserByEmail(email, password) {
  try {
    console.log(`🔍 Searching for existing user: ${email}`);
    
    // Sign in to get the user ID
    const signInMutation = `
      mutation SignIn($input: SignInInput!) {
        signIn(input: $input) {
          code
          success
          message
          userId
          role
        }
      }
    `;

    const signInVariables = {
      input: {
        email: email,
        password: password
      }
    };

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: signInMutation,
        variables: signInVariables
      })
    });

    console.log('SignIn response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('SignIn result:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.log('❌ SignIn errors:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
        });
        return null;
      }
      
      if (result.data && result.data.signIn) {
        const { userId, role } = result.data.signIn;
        console.log(`✅ User found: ${email} (ID: ${userId}, Role: ${role})`);
        return userId;
      }
    } else {
      console.log('❌ HTTP error:', response.status);
      console.log('Response text:', await response.text());
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
  const targetEmail = 'chikachan1017@gmail.com';
  const targetPassword = '"$princess123."';
  
  console.log('🚀 Testing becomeHost for user chikachan1017@gmail.com...');
  console.log('========================================================');
  
  // Step 1: Find the existing user
  const userId = await findUserByEmail(targetEmail, targetPassword);
  
  if (userId) {
    // Step 2: Test the becomeHost mutation
    await testBecomeHost(userId, targetEmail);
  } else {
    console.log(`❌ Could not find user ID for ${targetEmail}`);
    console.log('💡 Possible solutions:');
    console.log('1. Verify the password is correct');
    console.log('2. Check if the user exists in MongoDB');
    console.log('3. Ensure authentication services are running');
  }
}

// Run the test
main().then(() => {
  console.log('\n✅ Test sequence completed');
}).catch(error => {
  console.error('❌ Test sequence failed:', error);
});