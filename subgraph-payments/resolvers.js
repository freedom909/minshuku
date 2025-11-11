import { AuthenticationError } from '../infrastructure/utils/errors.js';
import { requireAuth } from '../infrastructure/auth/authAndRole.js';

const resolvers = {
  Query: {
    payment: async (_, { id }, { dataSources, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view payment information');
      }
      const { paymentService } = dataSources;
      const payment = await paymentService.getPaymentInfo(id);
      if (!payment) {
        throw new Error('Payment not found');
      }
      return payment;
    },
    
    paymentsByGuest: async (_, { guestId }, { dataSources, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view payment information');
      }
      const { paymentService } = dataSources;
      return await paymentService.getPaymentsByGuest(guestId);
    },
    
    paymentsByOrder: async (_, { orderId }, { dataSources, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view payment information');
      }
      const { paymentService } = dataSources;
      return await paymentService.getPaymentsByOrder(orderId);
    },
    
    wallet: async (_, { userId: walletUserId }, { dataSources, userId }) => {
      if (!userId) {
        throw new AuthenticationError('You must be logged in to view wallet information');
      }
      const { paymentService } = dataSources;
      return await paymentService.getWallet(walletUserId);
    },
  },
  
  Mutation: {
    processPayment: requireAuth(async (_, { input }, { dataSources, userId }) => {
      const { paymentService } = dataSources;
      try {
        const payment = await paymentService.processPayment({
          ...input,
          guestId: userId
        });
        
        return {
          code: 200,
          success: true,
          message: 'Payment processed successfully',
          payment
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: error.message || 'Payment processing failed',
          payment: null
        };
      }
    }),
    
    addFunds: requireAuth(async (_, { input }, { dataSources, userId }) => {
      const { paymentService } = dataSources;
      try {
        const wallet = await paymentService.addFunds(input);
        
        return {
          code: 200,
          success: true,
          message: 'Funds added successfully',
          wallet
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: error.message || 'Failed to add funds',
          wallet: null
        };
      }
    }),
    
    processRefund: requireAuth(async (_, { input }, { dataSources, userId }) => {
      const { paymentService } = dataSources;
      try {
        const refundAmount = await paymentService.processRefund(input);
        
        return {
          code: 200,
          success: true,
          message: 'Refund processed successfully',
          refundAmount
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: error.message || 'Refund processing failed',
          refundAmount: 0
        };
      }
    }),
    
    confirmPayment: requireAuth(async (_, { paymentId }, { dataSources, userId }) => {
      const { paymentService } = dataSources;
      try {
        const payment = await paymentService.confirmPayment(paymentId);
        
        return {
          code: 200,
          success: true,
          message: 'Payment confirmed successfully',
          payment
        };
      } catch (error) {
        return {
          code: 400,
          success: false,
          message: error.message || 'Payment confirmation failed',
          payment: null
        };
      }
    }),
  },
};

export default resolvers;