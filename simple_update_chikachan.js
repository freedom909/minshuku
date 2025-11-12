// Simple script to update chikachan1017@gmail.com to PENDING_HOST using GraphQL

async function updateUserRole() {
  try {
    console.log('🚀 Attempting to update user role via GraphQL API...');
    
    // First, let's try to find the user ID by attempting different approaches
    console.log('🔍 Searching for user ID...');
    
    // Try to get user ID through a simple query (if available)
    const findUserQuery = `
      query FindUser($email: String!) {
        user(email: $email) {
          id
          email
          role
          status
        }
      }
    `;

    const findUserVariables = {
      email: 'chikachan1017@gmail.com'
    };

    const findResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: findUserQuery,
        variables: findUserVariables
      })
    });

    console.log('Find user response status:', findResponse.status);
    
    if (findResponse.ok) {
      const result = await findResponse.json();
      console.log('Find user result:', JSON.stringify(result, null, 2));
      
      if (result.data && result.data.user) {
        const userId = result.data.user.id;
        console.log('✅ Found user ID:', userId);
        
        // Now try the becomeHost mutation
        await testBecomeHost(userId);
        return;
      }
    }
    
    // If we can't find the user through the query, try the becomeHost mutation with a mock ID
    console.log('⚠️ Could not find user through query. Trying alternative approach...');
    
    // Since we know the email exists, let's try to use the becomeHost mutation
    // with the assumption that the system might be able to find the user by email
    const becomeHostMutation = `
      mutation BecomeHost($email: String!) {
        becomeHost(email: $email) {
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

    const mutationVariables = {
      email: 'chikachan1017@gmail.com'
    };

    const mutationResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: becomeHostMutation,
        variables: mutationVariables
      })
    });

    console.log('Mutation response status:', mutationResponse.status);
    
    if (mutationResponse.ok) {
      const result = await mutationResponse.json();
      console.log('Mutation result:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.log('❌ GraphQL Errors:');
        result.errors.forEach(error => {
          console.log(`- ${error.message}`);
          if (error.extensions && error.extensions.code) {
            console.log(`  Error Code: ${error.extensions.code}`);
          }
        });
      }
    } else {
      console.log('❌ HTTP error:', mutationResponse.status);
      console.log('Response text:', await mutationResponse.text());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testBecomeHost(userId) {
  try {
    console.log(`\n🚀 Testing becomeHost mutation for user ID: ${userId}`);
    
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

// Run the update
updateUserRole().then(() => {
  console.log('\n✅ Update process completed');
}).catch(error => {
  console.error('❌ Update process failed:', error);
});