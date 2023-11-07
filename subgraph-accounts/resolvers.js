import errors from '../utils/errors.js'
const { AuthenticationError, ForbiddenError } = errors
import d from './datasources/accounts.js'
const { dataSources } = d
const resolvers = {
  // TODO: fill in resolvers
  Query: {
    user: async (_, { id }, { dataSources }) => {
      const user = await dataSources.accountsAPI.getUser(id)
      if (!user) {
        throw new Error('No user found')
      }
      return user
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      const user = await dataSources.accountsAPI.getUser(userId);
      return user;
    },
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
          message: "Profile successfully updated!",
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
    signIn(_, { email, password }, { dataSources }) {
      return dataSources.accountsAPI.login({ email, password })
    }, logout(_, __, context) {
      return true
    },
    signUp(_, { SignUpInput }, { dataSources }) {
      return dataSources.accountsAPI.register({SignUpInput})
    },
  },
  User: {
    __resolveType(user) {
      return user.role
    }
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    },
    __coordinates: ({ id }, _, { dataSources }) => {
      return dataSources.accountsAPI.getGalacticCoordinates(id);
    }
  },
  Guset: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    }
  }
}

export default resolvers;
