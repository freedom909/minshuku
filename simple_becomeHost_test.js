// Simple test for becomeHost mutation - test basic functionality

async function testBecomeHost() {
  try {
    console.log('🚀 Testing becomeHost mutation functionality');
    
    // Test 1: Basic schema introspection
    console.log('\n🔍 Testing GraphQL schema...');
    
    const introspectionQuery = `
      query {
        __schema {
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }
    `;

    const introspectionResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    console.log('Introspection response status:', introspectionResponse.status);
    
    if (introspectionResponse.ok) {
      const introspectionResult = await introspectionResponse.json();
      console.log('Introspection result:', JSON.stringify(introspectionResult, null, 2));
      
      // Check if becomeHost mutation exists
      if (introspectionResult.data && introspectionResult.data.__schema) {
        const mutations = introspectionResult.data.__schema.mutationType?.fields || [];
        const becomeHostMutation = mutations.find(m => m.name === 'becomeHost');
        
        if (becomeHostMutation) {
          console.log('✅ becomeHost mutation is defined in schema');
        } else {
          console.log('❌ becomeHost mutation not found in schema');
          console.log('Available mutations:', mutations.map(m => m.name));
        }
      }
    }

    // Test 2: Try becomeHost mutation with a mock user ID
    console.log('\n📤 Testing becomeHost mutation with mock user ID...');
    
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

    // Try with a mock user ID first to test the mutation structure
    const mockVariables = { userId: "65a1b2c3d4e5f67890123456" };

    const mockResponse = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: becomeHostMutation,
        variables: mockVariables
      })
    });

    console.log('Mock mutation response status:', mockResponse.status);
    
    if (mockResponse.ok) {
      const mockResult = await mockResponse.json();
      console.log('Mock mutation result:', JSON.stringify(mockResult, null, 2));
      
      if (mockResult.errors) {
        console.log('\n🔧 Analysis of errors:');
        mockResult.errors.forEach(error => {
          console.log(`- ${error.message}`);
          if (error.extensions) {
            console.log(`  Extensions:`, error.extensions);
          }
        });
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