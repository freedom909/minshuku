// resolvers/identity.resolver.js
import { GraphQLError } from "graphql";

export default {
  Mutation: {
    verifyMyNumber: async (_, { frontKey, selfieKey }, { container, userId }) => {
      if (!userId)
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });

      try {
        const identityService = container.resolve("identityService");
        const result = await identityService.verify(
          userId,
          frontKey,
          selfieKey
        );

        return {
          success: result.success,
          similarity: result.similarity,
          message: result.success
            ? "Face verification successful"
            : "Face mismatch - verification failed",
        };
      } catch (err) {
        console.error("verifyMyNumber error:", err);
        throw new GraphQLError("Verification service error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};
