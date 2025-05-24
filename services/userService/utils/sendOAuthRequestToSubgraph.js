import axios from "axios";
async function sendOAuthRequestToSubgraph(provider, token) {
  console.log("Inside sendOAuthRequestToSubgraph");
  console.log("Provider:", provider);
  console.log("Token (type):", typeof token);
  console.log("Token (value):", token);

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
    }
  };

  try {
    const response = await axios.post('http://localhost:4010/graphql', {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log("Response from subgraph-auths:", response.data);
    return response.data;
  } catch (err) {
    console.error("Error sending request to subgraph-auths:", err.message);
    throw err;
  }
}
export default sendOAuthRequestToSubgraph;