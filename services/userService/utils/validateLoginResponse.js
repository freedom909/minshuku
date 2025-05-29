import { GraphQLError } from "graphql";

async function validateLoginResponse(response) {
    if (!response || typeof response !== 'object') {
      throw new GraphQLError("Unexpected login response", {
        extensions: { code: "AUTH_SERVICE_ERROR" },
      });
    }
  
    const { token, refreshToken, user, code, success, message } = response;
  
    if (!token || !user || !user.id || !user.role) {
      throw new GraphQLError("Malformed login response", {
        extensions: { code: "AUTH_SERVICE_ERROR" },
      });
    }
  
    return { token, refreshToken, user, code, success, message };
  }
  export default validateLoginResponse;
  