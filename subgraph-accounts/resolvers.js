import { validate } from 'graphql';
import errors from '../utils/errors.js'
const { AuthenticationError, ForbiddenError } = errors
import { validateInviteCode } from './helpers/validateInvitecode.js';


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
    
    logout(_, __, context, info) {
      return true;
      },

    async signIn(_,{email,password},{dataSources}){
      if (email && password) {
        return dataSources.accountsAPI.login(email,password);
      }
    },

    async signUpGuest(_, { input }, { dataSources }) {
      const { email, password, username, nickname, role } = input;
      return dataSources.accountsAPI.registerUser(email, password, username, nickname,role);
    },
    async signUpHost(_, { email, password, username, nickname, inviteCode }, { dataSources }) {
      const isValidInviteCode = await validateInviteCode(inviteCode);
    
      if (!inviteCode || !isValidInviteCode) {
        return dataSources.accountsAPI.registerUser(email, password, username, nickname, GUEST);
      }
      return dataSources.accountsAPI.registerHost(email, password, username, nickname, inviteCode);
    }
  },
  User: {
    __resolveType(user) {
      if (user.role === "HOST") {
        return "HOST"
      } else if (
        user.role === "GUEST") {
        return "GUEST"
      }
      // Handle other cases or return null if necessary
      return null;
    }
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    },
    // __coordinates: ({ id }, _, { dataSources }) => {
    //   return dataSources.accountsAPI.getGalacticCoordinates(id);
    // }
   },
 
  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id)
    }
  }
}

export default resolvers;
