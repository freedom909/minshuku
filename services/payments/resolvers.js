const resolvers = {
    Query: {
      payment: async (_, __, { dataSources }) => {
        // Replace with actual logic to fetch payment info
        return await dataSources.paymentsAPI.getPaymentInfo();
      },
    },
    Mutation: {
      addFundsToWallet: async (_, { amount }, { dataSources, userId }) => {
        try {
          const result = await dataSources.paymentsAPI.addFunds({ userId, amount });
          return {
            code: 200,
            success: true,
            message: 'Funds added successfully',
            amount: result.amount,
          };
        } catch (error) {
          return {
            code: 500,
            success: false,
            message: error.message,
          };
        }
      },
      cancelBooking: async (_, { bookingId }, { dataSources, userId }) => {
        try {
          // Fetch booking and perform logic to cancel it
          const booking = await dataSources.bookingsAPI.getBooking(bookingId);
          const refundAmount = booking.totalCost; // Example logic
  
          await dataSources.paymentsAPI.subtractFunds({ userId, amount: refundAmount });
          
          return {
            code: 200,
            success: true,
            message: 'Booking cancelled and refund processed',
            refundAmount,
          };
        } catch (error) {
          return {
            code: 500,
            success: false,
            message: error.message,
          };
        }
      },
    },
    Guest: {
      __resolveReference: async (reference, { dataSources }) => {
        return await dataSources.usersAPI.getGuestById(reference.id);
      },
    },
    Host: {
      __resolveReference: async (reference, { dataSources }) => {
        return await dataSources.usersAPI.getHostById(reference.id);
      },
    },
  };
  
  export default resolvers;
  