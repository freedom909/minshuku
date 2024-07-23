import { GraphQLDateTime } from 'graphql-scalars';

const resolvers = {
  DateTime: GraphQLDateTime,
  Query: {
    getBookingsByUser: async (_, { userId }, { dataSources }) => {
      return dataSources.cartService.getBookingsByUser(userId);
    },
    getBookingById: async (_, { id }, { dataSources }) => {
      return dataSources.cartService.getBookingById(id);
    },
  },
  Mutation: {
    confirmBooking: async (_, { id }, { dataSources }) => {
      return dataSources.cartService.updateBookingStatus(id, 'CONFIRMED');
    },
    cancelBooking: async (_, { id }, { dataSources }) => {
      return dataSources.cartService.updateBookingStatus(id, 'CANCELLED');
    },
  },
};

export default resolvers;
