import { GraphQLDateTime } from 'graphql-scalars';
import { permissions } from '../infrastructure/auth/permission.js';
const { isOwner, isHost, isAdmin } = permissions;
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();
// const BOOKING_CREATED = 'BOOKING_CREATED';

const resolvers = {

  DateTime: GraphQLDateTime,
  Query: {
    getBookingsByUser: async (_, { userId }, { dataSources }) => {
      if (!isAdmin && !isHost(userId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingsByUser(userId);
    },
    getBookingById: async (_, { id }, { dataSources }) => {
      if (!isAdmin && !isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingById(id);
    },
  },
  Mutation: {
    createBooking: async (_, {guestId, listingId}, { dataSources, pubsub }) => {
      const { cartService } = dataSources;
      const booking = await cartService.createBooking({ guestId, listingId });
      // pubsub.publish(BOOKING_CREATED, { bookingCreated: booking });
      return booking;
    },
    confirmBooking: async (_, { id }, { dataSources }) => {
      if (!isAdmin && !isHost(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.updateBookingStatus(id, 'CONFIRMED');
    },
    paymentforBooking: async (_, { bookingId, paymentData }, { dataSources }) => {
      if (!isAdmin &&!isHost(id) &&!isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.makePayment(bookingId, paymentData);
    },

    cancelBooking: async (_, { id }, { dataSources }) => {
      if (!isAdmin && !isHost(id) && !isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.updateBookingStatus(id, 'CANCELLED');
    },

    
  },
  // Subscription: {
  //   bookingCreated: {
  //     subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(BOOKING_CREATED),
  //   },
  // },
};

export default resolvers;
