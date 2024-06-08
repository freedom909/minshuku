import errors from '../utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
const { AuthenticationError, ForbiddenError } = errors;
import { validateInviteCode } from './helpers/validateInvitecode.js';
import DateTimeType from '../shared/src/scalars/DateTimeType.js';

const resolvers = {
  DateTime:DateTimeType,
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
      const user = await dataSources.accountsAPI.getUser(id);
      if (!user) {
        GraphQLError(message, {extension:{code:'No user found'}});
      }
      return user;
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      const user = await dataSources.accountsAPI.getUser(userId);
      return user;
    },
    account(root, { id }, { dataSources }) {
      return dataSources.accountsAPI.getAccountById(id);
    },
    accounts(root, args, { dataSources }) {
      return dataSources.accountsAPI.getAccounts();
    },
    viewer(root, args, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.accountsAPI.getAccountById(user.sub);
      }
      return null;
    }
  },

  Mutation: {
    updateProfile: async (_, { updateProfileInput }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      try {
        const updatedUser = await dataSources.accountsAPI.updateUser({
          userId,
          userInfo: updateProfileInput,
        });
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
      // Logic to handle session termination can be added here
      if(context.session){
        context.session.destroy(
          (err) => {
            if (err) {
              throw new GraphQLError(message,{extension:{code:'Failed to terminate the session'}});
            }
          },
        );
      }
      return true;
    },

    signIn: async (_, { input: { email, password } }, { dataSources }) => {
      if (email && password) {
        return dataSources.accountsAPI.login(email, password);
      }
      throw new GraphQLError(message,{extension:{code:'Email and password must be provided'}});
    },

    signUp: async (_, { signUpInput }, { dataSources }) => {
      const { email, password, name, nickname, role, inviteCode, picture } = signUpInput;
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
    createAccount(root, { input: { email, password } }, { dataSources }) {
      return dataSources.accountsAPI.createAccount(email, password);
    },
    deleteAccount(root, { id }, { dataSources }) {
      return dataSources.accountsAPI.deleteAccount(id);
    },
    updateAccountEmail(root, { input: { id, email } }, { dataSources }) {
      return dataSources.accountsAPI.updateAccountEmail(id, email);
    },
    updateAccountPassword(
      root,
      { input: { id, newPassword, password } },
      { dataSources }
    ) {
      return dataSources.accountsAPI.updateAccountPassword(
        id,
        newPassword,
        password
      );
    }
  
  },

  User: {
    __resolveType(user) {
      if (user.role === 'HOST') {
        return 'Host';
      } else if (user.role === 'GUEST') {
        return 'Guest';
      }
      // Handle other cases or return null if necessary
      return null;
    },
  },

  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
    // Uncomment and implement if necessary
    // __coordinates: ({ id }, _, { dataSources }) => {
    //   return dataSources.accountsAPI.getGalacticCoordinates(id);
    // }
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    }
  },
  Account:{
    __resolveReference(reference){
      return accounts.find(account => account.id ===reference.id)
    }
  }
}

export default resolvers;