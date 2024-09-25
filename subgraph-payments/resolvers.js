const resolvers = {
  Query: {
    payment: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view payment information');
      }
      const { paymentService } = dataSources;
      const payment = await paymentService.getPayment(userId);
      if (!payment) {
        return {
          code: 404,
          success: false,
          message: 'Payment not found',
        };
      }
      // Implement the logic to fetch payment information
      return payment;
      // Implement the logic to fetch payment information

    },
  },
  Mutation: {
    addFundsToWallet: async (_, { amount }, { dataSources, user }) => {
      const userId = user?.id;
      if (!userId) {
        throw new AuthenticationError('You must be logged in to add funds to your wallet');
      }
      const { paymentService } = dataSources;
      // Implement the logic to add funds to the wallet
      const funds = await paymentService.addFunds({ userId, amount });
      return {
        code: 200,
        success: true,
        message: 'Funds added successfully',
        amount: funds.amount, // assuming the response contains the updated amount
      };
    },
    cancelBooking: async (_, { bookingId }, { dataSources, user }) => {
      const userId = user?.id;
      if (!{ guestId: userId }) {
        throw new AuthenticationError('You must be logged in to cancel a booking');
      }
      if (criteria.time >= new now()) {
        throw new Error('You can only cancel a booking if it is in the future');

      }
      const { bookingService, listingService, paymentService } = dataSources;
      // Fetch the booking details
      const booking = await bookingService.getBooking(bookingId);
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
        await bookingService.addFunds({ userId: booking.guestId, amount: refundAmount });

        // Update the host's earnings by subtracting the refund amount
        const hostId = await listingService.getHostIdForListing(booking.listingId);
        await paymentService.subtractFunds({ userId: hostId, amount: refundAmount });

        // Optionally, update the booking status to 'CANCELLED'
        await bookingService.updateBookingStatus(bookingId, 'CANCELLED');

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
