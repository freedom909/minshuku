import { addVerificationJob } from '../mq/verificationQueue.js'; // Corrected path
import { GraphQLError } from 'graphql';

const identityResolvers = { // This is the correct file for identity resolvers
  Mutation: {
    becomeHost: async (_, { input }, { dataSources, userId }) => {
      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
      
      const { frontKey, backKey, selfieKey } = input;
      
      if (!frontKey || !backKey || !selfieKey) {
        throw new GraphQLError('Front, back, and selfie images are required.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      
      // Add a job to the verification queue
      await addVerificationJob({ userId, frontKey, backKey, selfieKey });
      
      // Update user role to PENDING_HOST immediately
      await dataSources.userService.updateUserRole(userId, 'PENDING_HOST');
      
      return {
        success: true,
        message: "Verification submitted. We'll notify you upon completion.",
      };
    },
  },
};

export default identityResolvers;
