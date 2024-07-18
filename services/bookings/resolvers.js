import { v4 as uuidv4 } from 'uuid';
import {AuthenticationError, ForbiddenError} from '../../infrastructure/utils/errors.js';
import { requireAuth, requireRole } from '../../infrastructure/auth/authAndRole.js';
import { Prisma } from '@prisma/client';
import { permissions } from '../../infrastructure/auth/permission.js';
const { bookingsWithPermission } = permissions;


const resolvers = {
  Query: {
    booking: requireAuth(async (_, { id }, { dataSources, context }) => {
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
      const { bookingService } = dataSources;
      return await bookingService.getBooking(id);
    }),
    bookingsForUser: requireAuth(async (_, { userId }, { dataSources, context }) => {
      const { bookingService, userService } = dataSources;
      if (!userId) {
        throw new AuthenticationError('You need to be logged in to view bookings');
      }
      const existingUser = await userService.find({ userId });
      if (!existingUser) {
        throw new ForbiddenError('User not found', { extension: { code: 'forbidden' } });
      }
      if (existingUser.role === 'GUEST') {
        const bookings = await bookingService.find({ where: { id: context.bookingsId } });
        return bookings;
      }
      return await bookingService.getBookingsForUser(userId);
    }),
    bookingsForListing: requireRole('Host', async (_, { listingId, status }, { dataSources, userId }) => {
      const { bookingService, listingService } = dataSources;
      const listings = await listingService.getListingsForUser(userId);
      if (!listings.find(listing => listing.id === listingId)) {
        throw new ForbiddenError('Listing does not belong to host', { extension: { code: 'forbidden' } });
      }
      const bookings = await bookingService.getBookingsForListing(listingId, status) || [];
      return bookings;
    }),
    currentGuestBooking: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const { bookingService } = dataSources;
      const booking = await bookingService.getCurrentGuestBooking(userId);
      return booking;
    }),
    guestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForUser(userId);
      return bookings;
    }),
    pastGuestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForUser(userId, 'COMPLETED');
      return bookings;
    }),
    upcomingGuestBookings: requireRole('Guest', async (_, __, { dataSources, userId }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForUser(userId, 'UPCOMING');
      return bookings;
    }),
  },

  Mutation: {
    createBooking: requireAuth(async (_, { createBookingInput }, { dataSources, userId }) => {
      const { bookingService, listingService, paymentService } = dataSources;
      const { listingId, checkInDate, checkOutDate } = createBookingInput;
      const { totalCost } = await listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });
      try {
        await paymentService.subtractFunds({ userId, amount: totalCost });
      } catch (error) {
        throw new ForbiddenError('Insufficient funds', { extension: { code: 'forbidden' } });
      }
      try {
        const booking = await bookingService.createBooking({
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

    confirmBooking: requireAuth(async (_, { id }, { dataSources }) => {
      const { bookingService } = dataSources;
      try {
        const booking = await bookingService.updateBookingStatus({
          id,
          status: 'COMPLETED',
          confirmedAt: new Date().toISOString(),
        });
        return booking;
      } catch (error) {
        throw new ForbiddenError('Unable to confirm booking', { extension: { code: 'forbidden' } });
      }
    }),

    cancelBooking: requireAuth(async (_, { id }, { dataSources }) => {
      const { bookingService } = dataSources;
      try {
        const booking = await bookingService.updateBookingStatus({
          id,
          status: 'CANCELLED',
          cancelledAt: new Date().toISOString(),
        });
        return booking;
      } catch (error) {
        throw new ForbiddenError('Unable to cancel booking', { extension: { code: 'forbidden' } });
      }
    }),

    addFundsToWallet: requireAuth(async (_, { amount }, { dataSources, userId }) => {
      const { paymentService } = dataSources;
      try {
        const updateWallet = await paymentService.addFunds({ userId, amount });
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
      const { listingService } = dataSources;
      return await listingService.getListing(listingId);
    },
    guest: async ({ guestId }, _, { dataSources }) => {
      const { userService } = dataSources;
      return await userService.getUser(guestId);
    },
    checkInDate: ({ checkInDate }) => new Date(checkInDate).toISOString(),
    checkOutDate: ({ checkOutDate }) => new Date(checkOutDate).toISOString(),
    status: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      const booking = await bookingService.getBooking(id);
      return booking.status;
    },
    confirmedAt: ({ confirmedAt }) => confirmedAt ? new Date(confirmedAt).toISOString() : null,
    cancelledAt: ({ cancelledAt }) => cancelledAt ? new Date(cancelledAt).toISOString() : null,
    totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
      const { listingService } = dataSources;
      const { totalCost } = await listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });
      return totalCost;
    },
    __resolveReference: async (booking, { dataSources }) => {
      const { bookingService } = dataSources;
      return await bookingService.getBooking(booking.id);
    },
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      const { userService } = dataSources;
      return userService.getUser(user.id);
    },
  },

  Listing: {
    bookings: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      return bookingService.getBookingsForListing(id);
    },
    __resolveReference: (listing, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getListing(listing.id);
    },
  },
};

export default resolvers;
