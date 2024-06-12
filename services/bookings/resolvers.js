import errors from '../../infrastructure/utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors;
import { requireAuth, requireRole } from '../../infrastructure/auth/authAndRole.js';

const resolvers = {
  Query: {
    bookingsForListing: requireRole('Host', async (_, { listingId, status }, { dataSources, userId }) => {
      const listings = await dataSources.listingsAPI.getListingsForUser(userId);
      if (listings.find((Listing) => Listing.id === listingId)) {
        const bookings = await dataSources.bookingsAPI.getBookingsForListing(listingId, status) || [];
        return bookings;
      } else {
        throw new Error('Listing does not belong to host');
      }
    }),

    currentGuestBooking: requireRole('Guest', async (_, { listing }, { dataSources, userId }) => {
      const { listingId, checkInDate, checkOutDate } = listing;
      const bookings = await dataSources.bookingsAPI.getCurrentGuestBooking(listingId, checkInDate, checkOutDate);
      return bookings;
    }),

    guestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId);
      return bookings;
    }),

    pastGuestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, 'COMPLETED');
      return bookings;
    }),

    upcomingGuestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, 'UPCOMING');
      return bookings;
    }),
  },

  Mutation: {
    createBooking: requireAuth(async (_, { createBookingInput }, { dataSources, userId }) => {
      const { listingId, checkInDate, checkOutDate } = createBookingInput;
      const { totalCost } = await dataSources.listingsAPI.getTotalCost({ id: listingId, checkInDate, checkOutDate });
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
          id: uuidv4(),
          listingId,
          checkInDate,
          checkOutDate,
          totalCost,
          guestId: userId,
          status: 'UPCOMING',
        });
        return {
          code: 200,
          success: true,
          message: 'Your Booking has been created',
          booking,
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: "We couldn’t complete your request because your funds are insufficient.",
        };
      }
    }),
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
    __resolveReference: (booking, { dataSources }) => {
      return dataSources.bookingsAPI.getBooking(booking.id);
    },
    totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
      const { totalCost } = await dataSources.listingsAPI.getTotalCost({
        id: listingId,
        checkInDate,
        checkOutDate,
      });
      return totalCost;
    },
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
    funds: requireAuth(async (_, __, { dataSources, userId }) => {
      const wallet = await dataSources.accountsAPI.getUserWallet(userId);
      return {
        funds: wallet.funds,
      };
    }),
    addFundsToWallet: requireAuth(async (_, { amount }, { dataSources, userId }) => {
      try {
        const updateWallet = await dataSources.paymentsAPI.addFunds({ userId, amount });
        return {
          success: true,
          message: "Funds added successfully",
          data: updateWallet.amount,
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: "We couldn’t complete your request because your funds are insufficient.",
        };
      }
    }),
  },

  Listing: {
    bookings: async ({ id }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getBookingsForListing(id);
    },
    __resolveReference: (listing, { dataSources }) => {
      return dataSources.listingsAPI.getListing(listing.id);
    },
  },
};

export default resolvers;
