// ✅ Correct export
export default async function sendOAuthRequestToSubgraph(provider, token) {
    try {
      const response = await fetch('http://localhost:4010/graphql', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `
            mutation {
              authenticateOAuthUser(provider: "${provider}") {
                success
                message
              }
            }
          `
        })
      });
  
      const data = await response.json();
      console.log("OAuth response from subgraph:", data);
  
      return {
        success: data?.data?.authenticateOAuthUser?.success,
        message: data?.data?.authenticateOAuthUser?.message
      };
    } catch (err) {
      console.error("OAuth backend call failed:", err);
      return { success: false, message: err.message };
    }
  }
  