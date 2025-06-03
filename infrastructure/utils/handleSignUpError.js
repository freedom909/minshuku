import { GraphQLError } from "graphql";
function handleSignUpError(error) {
    console.error("❌ Sign-up error:", error);
  
    if (error instanceof GraphQLError) {
      throw error;
    }
  
    throw new GraphQLError("Registration failed: " + error.message, {
      extensions: {
        code: "REGISTRATION_FAILED",
        error: error.message,
      },
    });
  }
export default handleSignUpError;