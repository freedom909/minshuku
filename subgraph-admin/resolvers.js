
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    pendingHosts: async (_, __, context) => {
      const { dataSources,logger, userId } = context;
      const userService = dataSources?.userService;

      // 1. Authorization: Check if the current user is an admin.
      if (!userId) {
        throw new GraphQLError('You must be logged in to view pending hosts.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
 try {
      // This assumes userService.getUserById can fetch user details including the role.
      const adminUser = await userService.getUserById(userId);
      if (adminUser?.role !== 'ADMIN') {
        throw new GraphQLError('You are not authorized to view pending hosts.', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      // 2. Data Fetching: Fetch users with the 'PENDING_HOST' role.
      // This assumes a method `findUsersByRole` exists in your userService.
      const pending = await userService.findUsersByRole('PENDING_HOST');

      // 3. Return fetched data.
      return pending;
    } catch (err) {
      logger.error('Error fetching pending hosts:', err);
      throw new GraphQLError('Internal server error while fetching pending hosts.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },
},
  Mutation: {
    becomeHost: async (_, { input }, context) => {
      const { container, userId, logger } = context;
      if (!userId) {
        throw new GraphQLError('You must be logged in to become a host.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      const myNumberService = container.resolve('myNumberCardService');
            if (!myNumberService) {
        logger?.error?.("myNumberCardService not registered in container");
        throw new GraphQLError("Server configuration error", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
      try {
        const result = await myNumberService.verifyMyNumberCard({
          userId,
          frontKey: input.frontKey,
          backKey: input.backKey,
          selfieKey: input.selfieKey
        });

        if (result.success) {
          return { success: true, message: "Your My Number verified and approved. You are now a host." };
        } else {
          return { success: true, message: "Verification pending admin review." };
        }
      } catch (err) {
        console.error("becomeHost error:", err);
        throw new GraphQLError("Verification failed", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
      }
    },

 approveHost: async (_, { userId: targetUserId }, context) => {
      const { dataSources, userId: adminId, logger } = context;
      const userService = dataSources?.userService;
      if (!adminId) {
        throw new GraphQLError("You must be logged in as an admin.", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const adminUser = await userService.getUserById(adminId);
        if (!adminUser || adminUser.role !== "ADMIN") {
          throw new GraphQLError("You are not authorized to approve hosts.", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        // Update user role to HOST
        const updatedUser = await userService.updateUserRole(targetUserId, "HOST");
        if (!updatedUser) {
          throw new GraphQLError("Failed to update user role", {
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          });
        }

        return {
          code: 200,
          success: true,
          message: `User ${targetUserId} has been approved as a host.`,
          user: updatedUser,
        };
      } catch (err) {
        logger?.error?.("approveHost error:", err);
        throw new GraphQLError("Approve host failed", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },

  User: {
    __resolveReference: async (ref, { dataSources }) => {
      return await dataSources.userService.getUserById(ref.id);
    }
  }
}

export default resolvers;