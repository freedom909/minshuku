import axios from 'axios';

async function sendOAuthRequestToSubgraph(provider, token) {
  const query = `
mutation SignIn($input: SignInInput!) {
  signIn(input: $input) {
    success
    role
  }
}
  `;

  const variables = {
    input: {
      provider,
      token
    },
  };

  try {
    const response = await axios.post(
      'http://localhost:4010/graphql',
      { query, variables },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data.errors) {
      console.error('GraphQL errors:', response.data.errors);
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.signIn;
  } catch (error) {
    console.error('Error in sendOAuthRequestToSubgraph:', error.message || error);
    throw error;
  }
}

export default sendOAuthRequestToSubgraph;
