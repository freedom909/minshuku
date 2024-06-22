import { GraphQLError } from 'graphql';
import DateTimeType from '../infrastructure/scalar/DateTimeType.js';
import { authenticateJWT, checkPermissions } from '../infrastructure/auth/auth.js';
import { permissions } from '../infrastructure/auth/permission.js';
import { validateInviteCode } from '../infrastructure/helpers/validateInvitecode.js';

const { isAdmin, isHost } = permissions;

const resolvers = {
  DateTime: DateTimeType,

  Account: {
    __resolveReference(_, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(_.id);
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
      const user = await dataSources.accountsAPI.getUser(id);
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return user;
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return dataSources.accountsAPI.getUser(userId);
    },
    account: async (_, { id }, { dataSources }) => {
      return dataSources.accountsAPI.getAccountById(id);
    },
    accounts: async (_, __, { dataSources }) => {
      return dataSources.accountsAPI.getAccounts();
    },
    viewer: async (_, __, { dataSources, user }) => {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(user.sub);
      }
      return null;
    },
    bookings: async (_, __, { ctx, dataSources }) => {
      const { user } = ctx;
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return dataSources.bookingsAPI.getBookingsForUser(user);
    },
    bookingsByUser: async (_, { userId }, { dataSources }) => {
      return dataSources.bookingsAPI.getBookingsByUserId(userId);
    },
    bookingById: async (_, { id }, { dataSources }) => {
      return dataSources.bookingsAPI.getBookingById(id);
    },
    listings: async (_, __, { ctx, dataSources }) => {
      const { user } = ctx;
      if (!user) throw new GraphQLError('You must be logged in to view your listing', { extensions: { code: 'UNAUTHENTICATED' } });

      if (user.role === 'HOST') {
        const listings = await dataSources.listingsAPI.getListingsForHost(user.id);
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
      const user = await dataSources.accountsAPI.getUser(userId);
      if (user.role !== 'ADMIN') {
        throw new GraphQLError('Only admin can create a user', { extensions: { code: 'UNAUTHORIZED' } });
      }
      const { name, password, email } = CreateUserInput;
      const newUser = await dataSources.accountsAPI.createUser({ name, email, password });
      return {
        code: 200,
        success: true,
        message: 'User successfully created',
        user: newUser,
      };
    },

    createListing: async (_, { CreateListingInput }, { dataSources, hostId, locationId }) => {
      const { title, description, price } = CreateListingInput;
      if (!hostId) {
        throw new GraphQLError('You do not have the right to create a listing', { extensions: { code: 'UNAUTHORIZED' } });
      }
      if (!locationId) {
        throw new GraphQLError('You must select a location', { extensions: { code: 'LOCATION_REQUIRED' } });
      }
      const newListing = await dataSources.listingsAPI.createListing({ title, description, price, locationId });
      return {
        code: 200,
        success: true,
        message: 'Listing successfully created',
        listing: newListing,
      };
    },

    updateProfile: async (_, { updateProfileInput }, { dataSources, userId }) => {
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      const updatedUser = await dataSources.accountsAPI.updateUser({ userId, userInfo: updateProfileInput });
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

    signIn: async (_, { input: { email, password } }, { dataSources }) => {
      if (email && password) {
        return dataSources.accountsAPI.login(email, password);
      }
      throw new GraphQLError('Email and password must be provided', { extensions: { code: 'EMAIL_PASSWORD_REQUIRED' } });
    },

    signUp: async (_, {input:{ email, password, name, nickname, role, inviteCode, picture }}, { dataSources }) => {
      
      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!inviteCode || !isValidInviteCode) {
          return dataSources.accountsAPI.registerGuest(email, name, password, nickname, 'GUEST', picture);
        }
        return dataSources.accountsAPI.registerHost(email, name, password, nickname, 'HOST', picture);
      } else {
        return dataSources.accountsAPI.registerGuest(email, name, password, nickname, 'GUEST', picture);
      }
    },

    createAccount: async (_, { input: { email, password } }, { dataSources }) => {
      return dataSources.accountsAPI.createAccount(email, password);
    },
    deleteAccount: async (_, { id }, { dataSources }) => {
      return dataSources.accountsAPI.deleteAccount(id);
    },
    updateAccountEmail: async (_, { input: { id, email } }, { dataSources }) => {
      return dataSources.accountsAPI.updateAccountEmail(id, email);
    },
    updateAccountPassword: async (_, { input: { id, newPassword, password } }, { dataSources }) => {
      return dataSources.accountsAPI.updateAccountPassword(id, newPassword, password);
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
  },

  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    }
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    }
  }
};

export default resolvers;
