import { GraphQLError } from 'graphql';

const resolvers = {
  Account: {
    __resolveReference: async (account, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.getAccountById(account.id);
    },
    id(account) {
      return account._id || account.id;
    },
    createdAt(account) {
      return account.createdAt || account.created_at;
    },
    email(account) {
      return account.email;
    }
  },

  User: {
    __resolveType(user) {
      if (user.role === 'HOST') {
        return 'Host';
      } else if (user.role === 'GUEST') {
        return 'Guest';
      }
      return 'User';
    },
    listings(user, _, { dataSources }) {
      const { listingService } = dataSources;
      return listingService.getListingsByUser(user.id);
    }
  },

  Host: {
    __resolveReference: async (user, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.getUser(user.id);
    },
    listings(user, _, { dataSources }) {
      const { listingService } = dataSources;
      return listingService.getListingsByHost(user.id);
    }
  },

  Guest: {
    __resolveReference: async (user, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.getUser(user.id);
    },
    bookings(user, _, { dataSources }) {
      const { bookingService } = dataSources;
      return bookingService.getBookingsByGuest(user.id);
    },
    listings(user, _, { dataSources }) {
      const { listingService } = dataSources;
      return listingService.getListingsByGuest(user.id);
    }
  },

  Query: {
    user: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      const user = await accountService.getUser(id);
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return user;
    },
    me: async (_, __, { dataSources, userId }) => {
      const { accountService } = dataSources;
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return await accountService.getUser(userId);
    },
    account: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.getAccountById(id);
    },
    accounts: async (_, __, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.getAllAccounts();
    },
    viewer: async (_, __, { dataSources, user }) => {
      const { accountService } = dataSources;
      if (user?.sub) {
        return await accountService.getAccountById(user.sub);
      }
      return null;
    },
    userDashboard: async (_, { userId }, { dataSources }) => {
      const { userService } = dataSources;
      return await userService.getUserDashboard(userId);
    },
    users: async (_, __, { dataSources }) => {
      const { userService } = dataSources;
      return await userService.getUsers();
    },
  },

  Mutation: {
    createUser: async (_, { name, email, password }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Check if current user is admin
      if (userId) {
        const currentUser = await accountService.getUser(userId);
        if (currentUser.role !== 'ADMIN') {
          throw new GraphQLError('Only admin can create a user', { extensions: { code: 'UNAUTHORIZED' } });
        }
      }
      const newUser = await accountService.createUser({ name, email, password });
      return newUser;
    },

    updateUserProfile: async (_, { input }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only update their own profile unless they are admin
      if (input.id !== userId) {
        const currentUser = await accountService.getUser(userId);
        if (currentUser.role !== 'ADMIN') {
          throw new GraphQLError('Can only update your own profile', { extensions: { code: 'UNAUTHORIZED' } });
        }
      }
      return await accountService.updateUser(input.id, input);
    },

    updateUser: async (_, { id, input }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only update their own profile unless they are admin
      if (id !== userId) {
        const currentUser = await accountService.getUser(userId);
        if (currentUser.role !== 'ADMIN') {
          throw new GraphQLError('Can only update your own profile', { extensions: { code: 'UNAUTHORIZED' } });
        }
      }
      return await accountService.updateUser(id, input);
    },

    deleteUser: async (_, { id }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Only admin can delete users
      const currentUser = await accountService.getUser(userId);
      if (currentUser.role !== 'ADMIN') {
        throw new GraphQLError('Only admin can delete users', { extensions: { code: 'UNAUTHORIZED' } });
      }
      return await accountService.deleteUser(id);
    },

    createAccount: async (_, { input: { email, password } }, { dataSources }) => {
      const { accountService } = dataSources;
      return await accountService.createAccount({ email, password });
    },
    
    deleteAccount: async (_, { id }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only delete their own account unless they are admin
      if (id !== userId) {
        const currentUser = await accountService.getUser(userId);
        if (currentUser.role !== 'ADMIN') {
          throw new GraphQLError('Can only delete your own account', { extensions: { code: 'UNAUTHORIZED' } });
        }
      }
      return await accountService.deleteAccount(id);
    },
    
    updateAccountEmail: async (_, { input: { id, email } }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only update their own email unless they are admin
      if (id !== userId) {
        const currentUser = await accountService.getUser(userId);
        if (currentUser.role !== 'ADMIN') {
          throw new GraphQLError('Can only update your own email', { extensions: { code: 'UNAUTHORIZED' } });
        }
      }
      return await accountService.updateAccountEmail(id, email);
    },
    
    updateAccountPassword: async (_, { input: { id, newPassword, password } }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only update their own password
      if (id !== userId) {
        throw new GraphQLError('Can only update your own password', { extensions: { code: 'UNAUTHORIZED' } });
      }
      return await accountService.updateAccountPassword(id, newPassword, password);
    },

    updateProfile: async (_, { id, input }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      // Users can only update their own profile
      if (id !== userId) {
        throw new GraphQLError('Can only update your own profile', { extensions: { code: 'UNAUTHORIZED' } });
      }
      return await accountService.updateUser(id, input);
    },
  },

  User: {
    // Federated references
    __resolveReference: async (user, { dataSources }) => 
      await dataSources.userService.getUserById(user.id),
  }
};

export default resolvers;



