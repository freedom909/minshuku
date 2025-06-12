import { GraphQLDateTime } from 'graphql-scalars';
// import { permissions } from '../infrastructure/auth/permission.js';
//const { isOwner, isHost, isAdmin } = permissions;
import { PubSub } from 'graphql-subscriptions';
import dataSources from '@apollo/datasource-rest'


const BOOKING_CREATED = 'BOOKING_CREATED';

const resolvers = {
  Query: {
    getCartItems: async (_, { userId }, { dataSources }) => {
      if (!isAdmin &&!isOwner(userId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getCartItems(userId);
    },
    getCartItemById: async (_, { id }, { dataSources }) => {
      if (!isAdmin &&!isOwner(id)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getCartItemById(id);
    },
    getBookings: async (_, { userId }, { dataSources }) => {
      if (!isAdmin && !isHost(userId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookings();
    },
    getBookingsByHost: async (_, { hostId }, { dataSources }) => {
      if (!isAdmin && !isHost(hostId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingsByHost(hostId);
    },
    getBookingsByListing: async (_, { listingId }, { dataSources }) => {
      if (!isAdmin && !isHost(listingId)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingsByListing(listingId);
    },
    getBookingsByStatus: async (_, { status }, { dataSources }) => {
      if (!isAdmin && !isHost(status)) {
        throw new Error('Unauthorized');
      }
      return dataSources.cartService.getBookingsByStatus(status);
    },
    getBookingsByDate: async (_, { date }, { dataSources }) => {
      if (!isAdmin && !isHost(date)) {
        throw new Error('Unauthorized');
      }
    },
 
  Booking: {
    id: (parent) => parent._id,


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
  researchBooking:async (_, {guestId}, { dataSources }) => {
    if (!isAdmin &&!isHost(id) &&!isOwner(id)) {
      throw new Error('Unauthorized');
    }
    if(!guestId){
      throw new Error('GuestId is required');
    }
    return dataSources.cartService.searchBooking(guestId);
  },
  getBookingsByDateRange: async (_, { startDate, endDate }, { dataSources }) => {
    if (!isAdmin &&!isHost(startDate) &&!isOwner(endDate)) {
      throw new Error('Unauthorized');
    }
    return dataSources.cartService.getBookingsByDateRange(startDate, endDate);
  },
 
},
  Mutation: {
    removeFromCart: async (_, { input }, { dataSources }) => {
      try {
        const result = await dataSources.cartService.removeFromCart(input);
        return {
          code: 200,
          success: true,
          message: 'Item removed from cart successfully',
          cartItem: null
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
          cartItem: null
        };
      }
    },
    updateCartItem: async (_, { input }, { dataSources }) => {
      try {
        const cartItem = await dataSources.cartService.updateCartItem(input);
        return {
          code: 200,
          success: true,
          message: 'Item updated in cart successfully',
          cartItem
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
          cartItem: null
        };
      }
    } ,
    
    addToCart: async (_, { input }, { dataSources }) => {
      try {
        const cartItem = await dataSources.cartService.addToCart(input);
        return {
          code: 200,
          success: true,
          message: 'Item added to cart successfully',
          cartItem:cartItem
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: error.message,
          cartItem: null
        };  
      }
    },
    createBooking: async (_, {guestId, listingId}, { dataSources }) => {
      const { cartService } = dataSources;
      const booking = await cartService.createBooking({ guestId, listingId });
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
  Subscription: {
    
    bookingCreated: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(BOOKING_CREATED),
    },
  }
}
export default resolvers;
