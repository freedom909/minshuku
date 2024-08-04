import { v4 as uuidv4 } from 'uuid';
import { AuthenticationError, ForbiddenError } from '../infrastructure/utils/errors.js';
import { createClient } from 'graphql-ws';
import WebSocket from 'ws'
import { requireAuth, requireRole } from '../infrastructure/auth/authAndRole.js';
import { permissions } from '../infrastructure/auth/permission.js';
import Booking from '../infrastructure/models/booking.js';
import User from '../infrastructure/models/user.js';
import Listing from '../infrastructure/models/listing.js';
const { bookingsWithPermission } = permissions;

// const client = createClient({
//   url: 'ws://localhost:4000/graphql', // Replace with your GraphQL endpoint
// });
const client = createClient({
  url: 'ws://localhost:3000',
  webSocketImpl: WebSocket
})


let clients = []
function addClient(client) {
  clients.push(client)
  return clients
}
function removeClient(client) {
  clients = clients.filter(c => c !== client);
}

client.subscribe({
  query: `
  subscription{
    bookingCreated{
      id
      listingId
      guestId
      checkIn
      checkOut
      total
    }`
}, {
  next: (data) => {
    broadcast(subscriptionTopics.BOOKING_CREATED, data.subscriptionTopics.BOOKING_CREATED)
  },
  error: (error) => console.error('Error:', error),
  complete: () => console.log('Subscription complete'),
})

// function broadcastBookingCreated(booking) {
// Iterate over connected clients
//   clients.forEach(client => {
//     if (client.subscriptions.has('bookingCreated')) {
//       client.send(JSON.stringify({
//         type: 'data',
//         id: client.subscriptionId, // Or use a unique identifier
//         payload: {
//           bookingCreated: booking
//         }
//       }));
//     }
//   });
// }

const subscriptionTopics = {
  BOOKING_CREATED: 'bookingCreated',
  BOOKING_CANCELLED: 'bookingCancelled',
  BOOKING_CONFIRMED: 'bookingConfirmed',
};

function broadcast(topic, payload) {
  const clientsToNotify = clients.filter(client => client.subscriptionTopics.has(topic))
  clientsToNotify.forEach(client => {
    client.send(JSON.stringify({
      type: 'data',
      id: client.subscriptionId, // Or use a unique identifier
      payload: {
        [topic]: payload
      }
    }));
  });
}

const resolvers = {

  Query: {
    users: async (parent, args, { dataSources }) => {
      return dataSources.userService.getUsers();
    },
    booking: requireAuth(async (_, { id }, { dataSources, listingId, guestId }) => {
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
    createBooking: requireAuth(async (_, { guestId, createBookingInput }, { dataSources }) => {
      if (!guestId) {
        throw new AuthenticationError('You need to be logged in to create a booking');
      }
      const { listingId, checkInDate, checkOutDate } = createBookingInput;

      // Validate input data
      if (!listingId || !checkInDate || !checkOutDate) {
        throw new UserInputError('All booking details must be provided');
      }

      // Fetch total cost from listing service
      const { totalCost } = await dataSources.listingService.getTotalCost({ id: listingId, checkInDate, checkOutDate });

      // Subtract funds from user's account
      try {
        await dataSources.paymentService.subtractFunds({ guestId, amount: totalCost });
      } catch (error) {
        console.error('Payment Error:', error);
        throw new ForbiddenError('Insufficient funds', { extensions: { code: 'FORBIDDEN' } });
      }

      // Create booking
      try {
        const booking = await Booking.create({
          id: uuidv4(),
          listingId,
          checkInDate,
          checkOutDate,
          totalCost,
          guestId: guestId,
          status: 'UPCOMING',
        });
        //GraphQL-WS server's broadcast function
        broadcast(subscriptionTopics.BOOKING_CREATED, booking);
        return {
          code: 200,
          success: true,
          message: 'Your Booking has been created',
          booking,
        };

      } catch (error) {
        console.error('Booking Error:', error);
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
        broadcast(subscriptionTopics.BOOKING_CONFIRMED, booking);
        return {
          code: 200,
          success: true,
          message: 'Booking confirmed',
          booking,
        };
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
        broadcast(subscriptionTopics.BOOKING_CANCELLED, booking);
        return {
          code: 200,
          success: true,
          message: 'Booking cancelled',
          booking,
        };
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
  Subscription: {
    Subscription: {
      bookingCreated: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingCreated' };
          return { id };
        },
      },
      bookingConfirmed: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingConfirmed' };
          return { id };
        },
      },
      bookingCancelled: {
        subscribe: async (parent, args, { subscriptions }) => {
          const id = nextId++;
          subscriptions[id] = { id, topic: 'bookingCancelled' };
          return { id };
        },
      },
    },
  },
};

export default resolvers;
