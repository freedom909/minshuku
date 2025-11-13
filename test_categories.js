import fetch from 'node-fetch';

async function testCategoriesQuery() {
  try {
    const response = await fetch('http://localhost:4040/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            categories {
              id
              name
              image
              description
            }
          }
        `
      })
    });

    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error testing categories query:', error.message);
  }
}

testCategoriesQuery();