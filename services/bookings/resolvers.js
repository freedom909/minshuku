import { v4 as uuidv4 } from 'uuid';
import errors from './utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors;

const resolvers = {
  Query: {
    bookingsForListing: async (_, { listingId, status }, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError();
      if (userRole === 'Host') {
        const listings = await dataSources.listingsAPI.getListingsForUser(userId);
        if (listings.find((listing) => listing.id === listingId)) {
          const bookings = await dataSources.bookingsAPI.getBookingsForListing(listingId, status) || [];
          return bookings;
        } else {
          throw new Error('Listing does not belong to host');
        }
      } else {
        throw ForbiddenError('Only hosts have access to listing bookings');
      }
    },

    currentGuestBooking: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError();
      if (userRole === 'Guest') {
        const booking = await dataSources.bookingsAPI.getCurrentGuestBooking(userId);
        return booking;
      } else {
        throw ForbiddenError('Only guests have access to guest bookings');
      }
    },

    guestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId);
        return bookings;
      } else {
        throw ForbiddenError('Only guests have access to trips');
      }
    },

    pastGuestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, 'COMPLETED');
        return bookings;
      } else {
        throw ForbiddenError('Only guests have access to trips');
      }
    },

    upcomingGuestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, 'UPCOMING');
        return bookings;
      } else {
        throw ForbiddenError('Only guests have access to trips');
      }
    }
  },

  Mutation: {
    createBooking: async (_, { createBookingInput }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      const { listingId, checkInDate, checkOutDate } = createBookingInput;
      const { totalCost } = await dataSources.listingsAPI.getTotalCost({
        id: listingId,
        checkInDate,
        checkOutDate
      });
      try {
        await dataSources.paymentsAPI.subtractFunds({ userId, amount: totalCost });
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: "We couldn’t complete your request because your funds are insufficient.",
        };
      }
      try {
        const booking = await dataSources.bookingsAPI.createBooking({
          listingId,
          checkInDate,
          checkOutDate,
          totalCost,
          guestId: userId,
          status: "UPCOMING"
        });
        return {
          code: 200,
          success: true,
          message: 'Your booking has been created',
          booking
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: "We couldn’t complete your request.",
        };
      }
    },

    addFundsToWallet: async (_, { amount }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError();
      try {
        const updatedWallet = await dataSources.paymentsAPI.addFunds({ userId, amount });
        return {
          code: 200,
          success: true,
          message: "Funds added successfully",
          amount: updatedWallet.amount
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: "We couldn’t complete your request.",
        };
      }
    }
  },

  Booking: {
    listing: ({ listingId }) => {
      return { id: listingId };
    },
    checkInDate: ({ checkInDate }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getHumanReadableDate(checkInDate);
    },
    checkOutDate: ({ checkOutDate }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getHumanReadableDate(checkOutDate);
    },
    guest: ({ guestId }) => {
      return { id: guestId };
    },
    __resolveReference: async (booking, { dataSources }) => {
      return dataSources.bookingsAPI.getBooking(booking.id);
    },
    totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
      const { totalCost } = await dataSources.listingsAPI.getTotalCost({
        id: listingId,
        checkInDate,
        checkOutDate
      });
      return totalCost;
    }
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
    bookings: async ({ id }, _, { dataSources }) => {
      return await dataSources.bookingsAPI.getBookingsForUser(id);
    }
  },

  Listing: {
    bookings: async ({ id }, _, { dataSources }) => {
      return await dataSources.bookingsAPI.getBookingsForListing(id);
    },
    __resolveReference: (listing, { dataSources }) => {
      return dataSources.listingsAPI.getListing(listing.id);
    }
  }
};

export default resolvers;
