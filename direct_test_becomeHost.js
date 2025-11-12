// Direct test for becomeHost mutation with proper error handling

async function testBecomeHost() {
  try {
    console.log('🚀 Testing becomeHost mutation...');
    
    // First, let's try to get a single user to test with
    const getUserQuery = `
      query {
        getUser(id: "test-user-id") {
          id
          email
          role
          status
        }
      }
    `;

    console.log('🔍 Testing GraphQL connection...');
    const testResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getUserQuery
      })
    });

    console.log('Response status:', testResponse.status);
    
    if (testResponse.status === 429) {
      console.log('⚠️ Rate limiting detected. Service is returning 429 (Too Many Requests).');
      console.log('This is likely due to the authLimiter middleware.');
      console.log('The service needs to be restarted or the rate limiting needs to be configured differently.');
      return;
    }

    if (!testResponse.ok) {
      console.log('❌ Service not responding properly. Status:', testResponse.status);
      return;
    }

    const testResult = await testResponse.text();
    console.log('Raw response:', testResult);

    // Try to parse as JSON
    try {
      const parsedResult = JSON.parse(testResult);
      console.log('Parsed response:', JSON.stringify(parsedResult, null, 2));
    } catch (parseError) {
      console.log('Could not parse response as JSON:', parseError.message);
    }

    // Now test the becomeHost mutation with a hardcoded user ID
    // This is just to test if the mutation is properly defined
    const becomeHostMutation = `
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

    const variables = { userId: "65a1b2c3d4e5f67890123456" }; // Mock user ID

    console.log('\n📤 Testing becomeHost mutation...');
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
      const mutationResult = await mutationResponse.text();
      console.log('Mutation raw response:', mutationResult);
      
      try {
        const parsedMutation = JSON.parse(mutationResult);
        console.log('Mutation parsed response:', JSON.stringify(parsedMutation, null, 2));
      } catch (parseError) {
        console.log('Could not parse mutation response as JSON:', parseError.message);
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