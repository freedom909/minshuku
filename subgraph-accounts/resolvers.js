import { GraphQLError } from 'graphql';
// import DateTimeType from '../infrastructure/scalar/dateTime.js';
// import { authenticateJWT, checkPermissions } from '../../infrastructure/middleware/auth.js';
// import { permissions } from '../infrastructure/auth/permission.js';
// const { isAdmin, isHost } = permissions;

const resolvers = {
  // DateTime: DateTimeType,

  Account: {
    __resolveReference(account, { dataSources }) {
      const { accountService } = dataSources;
      if (account?.user?.sub) {
        return accountService.getAccountById(account.id);
      }
      throw new GraphQLError("Not authorized!", { extensions: { code: 'UNAUTHORIZED' } });
    },
    id(account) {
      return account.user_id;
    },
    createdAt(account) {
      return account.created_at;
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
      return null;
    },
    listings(user, _, { dataSources }) {
      const { listingService } = dataSources;
      return listingService.getListingsByUser(user.id);
    }
  },

  Host: {
    __resolveReference: (user, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getUser(user.id);
    },
    listings(user, _, { dataSources }) {
      const { listingService } = dataSources;
      return listingService.getListingsByHost(user.id);
    }
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getUser(user.id);
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
      return accountService.getUser(userId);
    },
    account: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getAccountById(id);
    },
    accounts: async (_, __, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getAllAccounts();
    },
    viewer: async (_, __, { dataSources, user }) => {
      const { accountService } = dataSources;
      if (user?.sub) {
        return accountService.getAccountById(user.sub);
      }
      return null;
    },
    userDashboard: async (_, { userId }, { dataSources }) =>
      dataSources.userService.getUserDashboard(userId),
    users: async (_, __, { dataSources }) =>
      dataSources.userService.getUsers(),
  },

  Mutation: {
    createUser: async (_, { name, email, password }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      const user = await accountService.getUser(userId);
      if (user.role !== 'ADMIN') {
        throw new GraphQLError('Only admin can create a user', { extensions: { code: 'UNAUTHORIZED' } });
      }
      const newUser = await accountService.createUser({ name, email, password });
      return newUser;
    },

    updateUserProfile: async (_, { input }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateUser(input.id, input);
    },

    updateUser: async (_, { id, input }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateUser(id, input);
    },

    deleteUser: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.deleteUser(id);
    },

    createAccount: async (_, { input: { email, password } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.createAccount(email, password);
    },
    deleteAccount: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.deleteAccount(id);
    },
    updateAccountEmail: async (_, { input: { id, email } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateAccountEmail(id, email);
    },
    updateAccountPassword: async (_, { input: { id, newPassword, password } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateAccountPassword(id, newPassword, password);
    },

    updateProfile: async (_, { id, input }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateUser(id, input);
    },
  },

  User: {
    // Federated references
    __resolveReference: async (user, { dataSources }) => 
      dataSources.userService.getUserById(user.id),
  }
};

export default resolvers;



