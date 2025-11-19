
import { GraphQLError } from 'graphql';
 
const resolvers = {
  Query: {
    pendingHosts: async (_, __, { dataSources, userId }) => {
      const { userService } = dataSources;

      // 1. Authorization: Check if the current user is an admin.
      if (!userId) {
        throw new GraphQLError('You must be logged in to view pending hosts.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // This assumes userService.getUserById can fetch user details including the role.
      const adminUser = await userService.getUserById(userId);
      if (adminUser?.role !== 'ADMIN') {
        throw new GraphQLError('You are not authorized to view pending hosts.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // 2. Data Fetching: Fetch users with the 'PENDING_HOST' role.
      // This assumes a method like `findUsersByRole` exists in your userService.
      const pending = await userService.findUsersByRole('PENDING_HOST');

      // 3. Return fetched data.
      return pending;
    },
  },
  Mutation: {
    becomeHost: async (_, __, context) => {
      const { userId, dataSources } = context;
      if (!userId) {
        throw new GraphQLError('You must be logged in to become a host.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        // This assumes a service exists to update the user's role.
        // The actual implementation might live in the 'users' subgraph.
        // For now, we'll add a placeholder for the logic.
        // const updatedUser = await dataSources.userService.updateUserRole(userId, 'PENDING_HOST');

        // Placeholder response since userService is not fully available here:
        const updatedUser = {
          id: userId,
          role: 'PENDING_HOST', // Simulate role update
          __typename: 'User'
        };

        return {
          code: 200,
          success: true,
          message: 'Your application to become a host has been submitted!',
          user: updatedUser,
        };
      } catch (error) {
        console.error('Error in becomeHost mutation:', error);
        throw new GraphQLError('Failed to submit host application.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },

    approveHost: async (_, { userId }, context) => {
      const { dataSources, userId: adminId } = context;
      if (!adminId) {
        throw new GraphQLError('You must be logged in as an admin.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      // In a real implementation, you would check if the logged-in user is an admin.
      // const adminUser = await dataSources.userService.getUser(adminId);
      // if (adminUser.role !== 'ADMIN') throw new GraphQLError('You are not authorized to approve hosts.', { extensions: { code: 'FORBIDDEN' } });

      // This would call the user service to update the role.
      // const updatedUser = await dataSources.userService.updateUserRole(userId, 'HOST');

      // Placeholder response:
      console.warn(`Simulating approval for user ${userId}. Replace with a real service call.`);
      const updatedUser = {
        id: userId,
        role: 'HOST', // Simulate role update
        __typename: 'User'
      };

      return {
        code: 200,
        success: true,
        message: `User ${userId} has been approved as a host.`,
        user: updatedUser,
      };
    },
  },
  User: {
    __resolveReference(user, { dataSources }) {
      // In a real implementation, you would fetch user details from the users service.
      // return dataSources.userService.getUser(user.id);
      return { ...user };
    }
  }
};

export default resolvers;