import fetch from 'node-fetch';

async function sendOAuthRequestToSubgraph(provider, token) {
  const graphqlEndpoint = 'http://localhost:4010/graphql'; // or ENV variable

  const query = `
    mutation SignIn($input: SignInInput!) {
      signIn(input: $input) {
        success
        userId
        role
      }
    }
  `;

  const variables = {
    input: { provider, idToken: token },
  };

  try {
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error('OAuth sign-in failed');
    }

    return result.data.signIn;

  } catch (error) {
    console.error('sendOAuthRequestToSubgraph error:', error);
    throw error;
  }
}

export default { sendOAuthRequestToSubgraph };
