import errors from '../utils/errors.js'
const { AuthenticationError, ForbiddenError } =errors
import d from './datasources/accounts.js'
const { dataSources } =d
const resolvers = {
  // TODO: fill in resolvers
  Query: {
    user:async (_,{id},{dataSources})=>{
      const user=await  dataSources.accountsAPI.getUser(id)
      if (!user) {
        throw new Error('No user found')
      }
      return user
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError(authErrMessage);
      const user = await dataSources.accountsAPI.getUser(userId);
      return user;
    },
  },

  Mutation:{
    updateProfile: async (_, { updateProfileInput },{ dataSources, userId })=>{
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
  }
  },
  User: {
    __resolveType (user) {
      return user.role
    }
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    }
  },
  Guset: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    }
  }
}

export default resolvers;
