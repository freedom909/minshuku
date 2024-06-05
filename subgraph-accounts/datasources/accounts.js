import errors from '../utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import { AuthenticationError, ForbiddenError }from '../../utils/errors.js';
import { validateInviteCode } from '../helpers/validateInvitecode.js';
import DateTimeType from '../../shared/src/scalars/DateTimeType.js';

const resolvers = {
  DateTime: DateTimeType,
  Account: {
    __resolveReference(reference, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(reference.id);
      }
      throw new AuthenticationError("Not authorized!");
    },
    id(account) {
      return account.user_id;
    },
    createdAt(account) {
      return account.created_at;
    }
  },

  Query: {
    user: async (_, { id }, { dataSources }) => {
      const user = await dataSources.accountsAPI.getUserById(id);
      if (!user) {
        throw new GraphQLError("No user found", { extensions: { code: 'NO_USER_FOUND' } });
      }
      return user;
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      const user = await dataSources.accountsAPI.getUserById(userId);
      return user;
    },
    account(_, { id }, { dataSources }) {
      return dataSources.accountsAPI.getAccountById(id);
    },
    accounts(_, __, { dataSources }) {
      return dataSources.accountsAPI.getAccounts();
    },
    viewer(_, __, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(user.sub);
      }
      return null;
    },
    bookings: async (_, __, { dataSources, user }) => {
      if (!user) throw new AuthenticationError('You must be logged in to view bookings');
      const bookings = await dataSources.accountsAPI.getBookingsForUser(user);
      return bookings;
    },
  },

  Mutation: {
    updateProfile: async (_, { updateProfileInput }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      try {
        const updatedUser = await dataSources.accountsAPI.updateUser(userId, updateProfileInput);
        return {
          code: 200,
          success: true,
          message: 'Profile successfully updated!',
          user: updatedUser,
        };
      } catch (err) {
        return {
          code: 400,
          success: false,
          message: err.message,
        };
      }
    },

    logout: (_, __, context) => {
      if (context.session) {
        context.session.destroy((err) => {
          if (err) {
            throw new GraphQLError("Failed to terminate the session", { extensions: { code: 'SESSION_TERMINATION_FAILED' } });
          }
        });
      }
      return true;
    },

    signIn: async (_, { input: { email, password } }, { dataSources }) => {
      if (email && password) {
        return dataSources.accountsAPI.login(email, password);
      }
      throw new GraphQLError("Email and password must be provided", { extensions: { code: 'BAD_USER_INPUT' } });
    },

    signUp: async (_, { signUpInput }, { dataSources }) => {
      const { email, password, name, nickname, role, inviteCode, picture } = signUpInput;
      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!inviteCode || !isValidInviteCode) {
          return dataSources.accountsAPI.registerGuest(email, password, name, nickname, 'GUEST', picture);
        }
        return dataSources.accountsAPI.registerHost(email, password, nickname, name, inviteCode, picture);
      } else {
        return dataSources.accountsAPI.registerGuest(email, password, name, nickname, 'GUEST', picture);
      }
    },

    createAccount(root, { input: { email, password } }, { dataSources }) {
      return dataSources.accountsAPI.createAccount(email, password);
    },

    deleteAccount(root, { id }, { dataSources }) {
      return dataSources.accountsAPI.deleteAccount(id);
    },

    updateAccountEmail(root, { input: { id, email } }, { dataSources }) {
      return dataSources.accountsAPI.updateAccountEmail(id, email);
    },

    updateAccountPassword(root, { input: { id, newPassword, password } }, { dataSources }) {
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
      return dataSources.accountsAPI.getUserById(user.id);
    },
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUserById(user.id);
    }
  }
};

export default resolvers;
