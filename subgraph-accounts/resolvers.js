import { GraphQLError } from 'graphql';
import DateTimeType from '../infrastructure/scalar/DateTimeType.js';
import { authenticateJWT, checkPermissions } from '../infrastructure/middleware/auth.js';
import { permissions } from '../infrastructure/auth/permission.js';

const { isAdmin, isHost } = permissions;

const resolvers = {
  DateTime: DateTimeType,

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
    getUser: async (_, { id }, { dataSources }) => {
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
    bookings: async (_, __, { ctx, dataSources }) => {
      const { cartService } = dataSources;
      const { user } = ctx;
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return cartService.getBookingsForUser(user);
    },
    bookingsByUser: async (_, { userId }, { dataSources }) => {
      const { cartService } = dataSources;
      return cartService.getBookingsByUserId(userId);
    },
    bookingById: async (_, { id }, { dataSources }) => {
      const { cartService } = dataSources;
      return cartService.getBookingById(id);
    },
    listings: async (_, __, { ctx, dataSources }) => {
      const { listingsAPI } = dataSources;
      const { user } = ctx;
      if (!user) throw new GraphQLError('You must be logged in to view your listing', { extensions: { code: 'UNAUTHENTICATED' } });

      if (user.role === 'HOST') {
        const listings = await listingsAPI.getListingsForHost(user.id);
        if (listings) {
          return listings;
        }
        throw new GraphQLError('No listings found for this host', { extensions: { code: 'NO_LISTINGS_FOUND' } });
      } else {
        throw new GraphQLError('You are not authorized to view listings', { extensions: { code: 'UNAUTHORIZED' } });
      }
    },
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

    createListing: async (_, { title, description, price, locationId, hostId }, { dataSources, user }) => {
      const { listingsAPI } = dataSources;
      if (!user || user.role !== 'HOST') {
        throw new GraphQLError('You do not have the right to create a listing', { extensions: { code: 'UNAUTHORIZED' } });
      }
      if (!locationId) {
        throw new GraphQLError('You must select a location', { extensions: { code: 'LOCATION_REQUIRED' } });
      }
      const newListing = await listingsAPI.createListing({ title, description, price, locationId, hostId });
      return newListing;
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

    researchListing: async (_, { hostId }, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getListingsByHost(hostId)
    },

    async updateListingStatus(id, status) {
      // Update the status of a listing in the database
      
      // Implement the logic here
    },
  
    cancelListing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.updateListingStatus(id, 'CANCELLED');
    },
    updateProfile: async (_, { id, input }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateUser(id, input);
    },

    logout: (_, __, context) => {
      if (context.session) {
        context.session.destroy(err => {
          if (err) {
            throw new GraphQLError('Failed to terminate the session', { extensions: { code: 'FAILED_TO_TERMINATE_SESSION' } });
          }
        });
      }
      return true;
    },
  }
};

export default resolvers;

// import AccountService from '../infrastructure/services/accountService.js';
// import AccountRepository from '../infrastructure/repositories/accountRepository.js';
// import connectToMongoDB from '../infrastructure/seeders/connectMongo.js';

// let accountService;

// (async () => {
//   const db = await connectToMongoDB();
//   const accountRepository = new AccountRepository({ mongodb: db });
//   accountService = new AccountService(accountRepository);
// })();

// const resolvers = {
//   Query: {
//     async getAccount(_, { id }) {
//       return await accountService.getAccountById(id);
//     },
//     async getAllAccounts() {
//       return await accountService.getAllAccounts();
//     },
//     // Add other query resolvers
//   },
//   Mutation: {
//     async createAccount(_, { account }) {
//       return await accountService.createAccount(account);
//     },
//     async updateAccountEmail(_, { id, email }) {
//       return await accountService.updateAccountEmail(id, email);
//     },
//     async updateAccountPassword(_, { id, password }) {
//       return await accountService.updateAccountPassword(id, password);
//     },
//     async deleteAccount(_, { id }) {
//       return await accountService.deleteAccount(id);
//     },
//     // Add other mutation resolvers
//   }
// };

// export default resolvers;

