import { GraphQLDateTime } from 'graphql-scalars';
import { permissions } from '../infrastructure/auth/permission.js';
const { isOwner, isHost, isAdmin } = permissions;
const resolvers = {


  DateTime: GraphQLDateTime,
  Query: {
    getBookingsByUser: async (_, { userId }, { dataSources }) => {
      if (!isAdmin &&!isHost(userId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingsByUser(userId);
    },
    getBookingById: async (_, { id }, { dataSources }) => {
      if (!isAdmin &&!isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingById(id);
    },
  },
  Mutation: {
    confirmBooking: async (_, { id }, { dataSources }) => {
      if (!isAdmin &&!isHost(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.updateBookingStatus(id, 'CONFIRMED');
    },

    cancelBooking: async (_, { id }, { dataSources }) => {
      if (!isAdmin &&!isHost(id)&&!isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.updateBookingStatus(id, 'CANCELLED');
    },
  },
};

export default resolvers;
