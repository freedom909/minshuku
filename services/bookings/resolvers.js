import errors from '../../infrastructure/utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors;
import { requireAuth, requireRole } from '../../infrastructure/auth/authAndRole.js';
import { Prisma } from '@prisma/client';
import { permissions } from '../../infrastructure/auth/permission.js';
const { bookingsWithPermission } = permissions;

const resolvers = {
  Query: {
    booking: requireAuth(async (_, __, { dataSources, context }) => {
      if (!(context.listingId || context.guestId)) {
        throw new ForbiddenError('No such booking', { extension: { code: 'forbidden' } });
      }
      if (bookingsWithPermission) {
        const existingListing = await Prisma.Listing.findUnique({
          where: { id: context.listingId },
        });
        if (!existingListing) {
          throw new ForbiddenError('Listing not found', { extension: { code: 'forbidden' } });
        }
      }
      return await dataSources.bookingsAPI.getBooking(context.bookingId);
    }),

    bookingsForUser: requireAuth(async (_, { userId }, { dataSources, context }) => {
      if (!userId) {
        throw new AuthenticationError('You need to be logged in to view bookings');
      }
      const existingUser = await dataSources.accountsAPI.find({ userId });
      if (!existingUser) {
        throw new ForbiddenError('User not found', { extension: { code: 'forbidden' } });
      }
      if (existingUser.role === 'GUEST') {
        const bookings = await dataSources.bookingsAPI.find({ where: { id: context.bookingsId } });
        return bookings;
      }
      return await dataSources.bookingsAPI.getBookingsForUser(userId);
    }),

    bookingsForListing: requireRole('Host', async (_, { listingId, status }, { dataSources, userId }) => {
      const listings = await dataSources.listingsAPI.getListingsForUser(userId);
      if (!listings.find(listing => listing.id === listingId)) {
        throw new ForbiddenError('Listing does not belong to host', { extension: { code: 'forbidden' } });
      }
      const bookings = await dataSources.bookingsAPI.getBookingsForListing(listingId, status) || [];
      return bookings;
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
        throw new ForbiddenError('Insufficient funds', { extension: { code: 'forbidden' } });
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
        throw new ForbiddenError('Unable to create booking', { extension: { code: 'forbidden' } });
      }
    }),
  },

  Booking: {
    // Resolver functions for Booking type
  },

  Guest: {
    // Resolver functions for Guest type
  },

  Listing: {
    // Resolver functions for Listing type
  },
};

export default resolvers;
