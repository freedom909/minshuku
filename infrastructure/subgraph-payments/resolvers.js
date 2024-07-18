const resolvers = {
  Query: {
    payment: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view payment information');
      }
      // Implement the logic to fetch payment information
      return 100; // example return value
    },
  },
  Mutation: {
    addFundsToWallet: async (_, { amount }, { dataSources, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to add funds to your wallet');
      }
      // Implement the logic to add funds to the wallet
      const response = await dataSources.paymentsAPI.addFunds({ userId, amount });
      return {
        code: 200,
        success: true,
        message: 'Funds added successfully',
        amount: response.amount, // assuming the response contains the updated amount
      };
    },
    cancelBooking: async (_, { bookingId }, { dataSources, userId, userRole }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to cancel a booking');
      }

      // Fetch the booking details
      const booking = await dataSources.bookingsAPI.getBooking(bookingId);
      if (!booking) {
        return {
          code: 404,
          success: false,
          message: 'Booking not found',
          refundAmount: 0,
        };
      }

      // Check if the user is allowed to cancel the booking
      if (userRole !== 'admin' && booking.guestId !== userId) {
        throw new AuthenticationError('You do not have permission to cancel this booking');
      }

      // Calculate the refund amount
      const refundAmount = booking.totalCost;

      try {
        // Update the guest's funds by adding the refund amount
        await dataSources.paymentsAPI.addFunds({ userId: booking.guestId, amount: refundAmount });

        // Update the host's earnings by subtracting the refund amount
        const hostId = await dataSources.listingsAPI.getHostIdForListing(booking.listingId);
        await dataSources.paymentsAPI.subtractFunds({ userId: hostId, amount: refundAmount });

        // Optionally, update the booking status to 'CANCELLED'
        await dataSources.bookingsAPI.updateBookingStatus(bookingId, 'CANCELLED');

        return {
          code: 200,
          success: true,
          message: 'Booking cancelled and refund issued',
          refundAmount,
        };
      } catch (error) {
        return {
          code: 500,
          success: false,
          message: 'Error processing the cancellation',
          refundAmount: 0,
        };
      }
    },
  },
  User: {
    __resolveType(user) {
      if (user.funds !== undefined) {
        return 'Guest';
      }
      if (user.earnings !== undefined) {
        return 'Host';
      }
      return null;
    },
  },
};

export default resolvers;
