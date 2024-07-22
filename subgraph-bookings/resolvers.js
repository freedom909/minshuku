import { v4 as uuidv4 } from 'uuid';
import { AuthenticationError, ForbiddenError } from '../infrastructure/utils/errors.js';
import { requireAuth, requireRole } from '../infrastructure/auth/authAndRole.js';
import { permissions } from '../infrastructure/auth/permission.js';
import Booking from '../infrastructure/models/booking.js';
import User from '../infrastructure/models/user.js';
import Listing from '../infrastructure/models/listing.js';

const { bookingsWithPermission } = permissions;

const resolvers = {
  Query: {
    users: async (parent, args, { dataSources }) => {
      return dataSources.userService.getUsers();
    },
    booking: requireAuth(async (_, { id }, { dataSources, userId, listingId, guestId }) => {
      if (!listingId && !guestId) {
        throw new ForbiddenError('No such booking', { extensions: { code: 'FORBIDDEN' } });
      }
      if (bookingsWithPermission) {
        const existingListing = await Listing.findOne({
          where: { id: listingId },
        });
        if (!existingListing) {
          throw new ForbiddenError('Listing not found', { extensions: { code: 'FORBIDDEN' } });
        }
      }
      return dataSources.bookingService.getBooking(id);
    }),
    bookingsForUser: requireAuth(async (_, { userId }, { dataSources, context }) => {
      if (!userId) {
        throw new AuthenticationError('You need to be logged in to view bookings');
      }
      const existingUser = await User.findOne({ where: { id: userId } });
      if (!existingUser) {
        throw new ForbiddenError('User not found', { extensions: { code: 'FORBIDDEN' } });
      }
      if (existingUser.role === 'GUEST') {
        return Booking.findAll({ where: { guestId: context.userId } });
      }
      return dataSources.bookingService.getBookingsForUser(userId);
    }),
    bookingsForListing: requireRole('HOST', async (_, { listingId, status }, { dataSources, userId }) => {
      const listings = await dataSources.listingService.getListingsForUser(userId);
      if (!listings.find(listing => listing.id === listingId)) {
        throw new ForbiddenError('Listing does not belong to host', { extensions: { code: 'FORBIDDEN' } });
      }
      return dataSources.bookingService.getBookingsForListing(listingId, status) || [];
    }),
    currentGuestBooking: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getCurrentGuestBooking(userId);
    }),
    guestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId);
    }),
    pastGuestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId, 'COMPLETED');
    }),
    upcomingGuestBookings: requireRole('GUEST', async (_, __, { dataSources, userId }) => {
      return dataSources.bookingService.getBookingsForUser(userId, 'UPCOMING');
    }),
  },

  Mutation: {
    createBooking: requireAuth(async (_, { createBookingInput }, { dataSources, userId }) => {
      const { listingId, checkInDate, checkOutDate } = createBookingInput;
      const { totalCost } = await dataSources.listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });
      try {
        await dataSources.paymentService.subtractFunds({ userId, amount: totalCost });
      } catch (error) {
        throw new ForbiddenError('Insufficient funds', { extensions: { code: 'FORBIDDEN' } });
      }
      try {
        const booking = await Booking.create({
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
        throw new ForbiddenError('Unable to create booking', { extensions: { code: 'FORBIDDEN' } });
      }
    }),

    confirmBooking: requireAuth(async (_, { id }, { dataSources }) => {
      try {
        const booking = await dataSources.bookingService.updateBookingStatus({
          id,
          status: 'COMPLETED',
          confirmedAt: new Date().toISOString(),
        });
        return booking;
      } catch (error) {
        throw new ForbiddenError('Unable to confirm booking', { extensions: { code: 'FORBIDDEN' } });
      }
    }),

    cancelBooking: requireAuth(async (_, { id }, { dataSources }) => {
      try {
        const booking = await dataSources.bookingService.updateBookingStatus({
          id,
          status: 'CANCELLED',
          cancelledAt: new Date().toISOString(),
        });
        return booking;
      } catch (error) {
        throw new ForbiddenError('Unable to cancel booking', { extensions: { code: 'FORBIDDEN' } });
      }
    }),

    addFundsToWallet: requireAuth(async (_, { amount }, { dataSources, userId }) => {
      try {
        const updateWallet = await dataSources.paymentService.addFunds({ userId, amount });
        return {
          code: 200,
          success: true,
          message: 'Funds added successfully',
          amount: updateWallet.amount,
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: 'We couldn’t complete your request because your funds are insufficient.',
        };
      }
    }),
  },

  Booking: {
    listing: async ({ listingId }, _, { dataSources }) => {
      return dataSources.listingService.getListing(listingId);
    },
    guest: async ({ guestId }, _, { dataSources }) => {
      return dataSources.userService.getUser(guestId);
    },
    checkInDate: ({ checkInDate }) => new Date(checkInDate).toISOString(),
    checkOutDate: ({ checkOutDate }) => new Date(checkOutDate).toISOString(),
    status: async ({ id }, _, { dataSources }) => {
      const booking = await dataSources.bookingService.getBooking(id);
      return booking.status;
    },
    confirmedAt: ({ confirmedAt }) => confirmedAt ? new Date(confirmedAt).toISOString() : null,
    cancelledAt: ({ cancelledAt }) => cancelledAt ? new Date(cancelledAt).toISOString() : null,
    totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
      const { totalCost } = await dataSources.listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });
      return totalCost;
    },
    __resolveReference: async (booking, { dataSources }) => {
      return dataSources.bookingService.getBooking(booking.id);
    },
  },

  Guest: {
    __resolveReference: async (user, { dataSources }) => {
      return dataSources.userService.getUser(user.id);
    },
  },

  Listing: {
    bookings: async ({ id }, _, { dataSources }) => {
      return dataSources.bookingService.getBookingsForListing(id);
    },
    __resolveReference: async (listing, { dataSources }) => {
      return dataSources.listingService.getListing(listing.id);
    },
  },
};

export default resolvers;
