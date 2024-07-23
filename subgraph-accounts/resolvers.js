import { GraphQLError } from 'graphql';
import DateTimeType from '../infrastructure/scalar/DateTimeType.js';
import { authenticateJWT, checkPermissions } from '../infrastructure/middleware/auth.js';
import { permissions } from '../infrastructure/auth/permission.js';
import validateInviteCode from '../infrastructure/helpers/validateInvitecode.js';

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
      return accountService.getAccounts();
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
    createUser: async (_, { CreateUserInput }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      const user = await accountService.getUser(userId);
      if (user.role !== 'ADMIN') {
        throw new GraphQLError('Only admin can create a user', { extensions: { code: 'UNAUTHORIZED' } });
      }
      const { name, password, email } = CreateUserInput;
      const newUser = await accountService.createUser({ name, email, password });
      return {
        code: 200,
        success: true,
        message: 'User successfully created',
        user: newUser,
      };
    },

    createListing: async (_, { CreateListingInput }, { dataSources, user }) => {
      const { listingsAPI } = dataSources;
      const { title, description, price, locationId } = CreateListingInput;
      if (!user || user.role !== 'HOST') {
        throw new GraphQLError('You do not have the right to create a listing', { extensions: { code: 'UNAUTHORIZED' } });
      }
      if (!locationId) {
        throw new GraphQLError('You must select a location', { extensions: { code: 'LOCATION_REQUIRED' } });
      }
      const newListing = await listingsAPI.createListing({ title, description, price, locationId, hostId: user.id });
      return {
        code: 200,
        success: true,
        message: 'Listing successfully created',
        listing: newListing,
      };
    },

    updateProfile: async (_, { updateProfileInput }, { dataSources, userId }) => {
      const { accountService } = dataSources;
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const updatedUser = await accountService.updateUser({ userId, userInfo: updateProfileInput });
      return {
        code: 200,
        success: true,
        message: 'Profile successfully updated',
        user: updatedUser,
      };
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
    researchBooking: async (_, { guestId }, { dataSources }) => {
      const { cartService } = dataSources;
      return cartService.getBookingsByGuest(guestId);
    },
    confirmBooking: async (_, { id }, { dataSources }) => {
      const { cartService } = dataSources;
      return cartService.confirmBooking(id);
    },
    cancelBooking: async (_, { id }, { dataSources }) => {
      const { cartService } = dataSources;
      return cartService.cancelBooking(id);
    },
    confirmListing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.updateListingStatus(id, 'CONFIRMED');
    },
    cancelListing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.updateListingStatus(id, 'CANCELLED');
    },
    updateUser: async (_, { id, input }, { dataSources }) => {
      const { userService } = dataSources;
      return userService.updateUser(id, input);
    },
    deleteUser: async (_, { id }, { dataSources }) => {
      const { userService } = dataSources;
      return userService.deleteUser(id);
    },
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
  },

  Host: {
    __resolveReference: (user, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getUser(user.id);
    }
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getUser(user.id);
    }
  }
};

export default resolvers;

