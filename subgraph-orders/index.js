import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import { startStandaloneServer } from '@apollo/server/standalone';
import { gql } from 'graphql-tag';

// Read the schema file
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

// Mock data for demonstration
const orders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    guestId: 'guest1',
    listingId: 'listing1',
    checkInDate: new Date('2024-12-01'),
    checkOutDate: new Date('2024-12-05'),
    totalPrice: 500.00,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const resolvers = {
  Query: {
    order: (_, { id }) => orders.find(order => order.id === id),
    ordersByGuest: (_, { guestId }) => orders.filter(order => order.guestId === guestId),
    ordersByHost: (_, { hostId }) => orders.filter(order => {
      // In a real implementation, you'd fetch the listing to get the host
      return order.listingId && order.listingId.startsWith('listing');
    }),
    pendingOrders: () => orders.filter(order => order.status === 'PENDING')
  },

  Mutation: {
    createOrder: (_, { input }) => {
      const newOrder = {
        id: String(orders.length + 1),
        orderNumber: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
        ...input,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      orders.push(newOrder);
      
      return {
        code: 201,
        success: true,
        message: 'Order created successfully',
        order: newOrder
      };
    },

    updateOrderStatus: (_, { input }) => {
      const order = orders.find(o => o.id === input.orderId);
      if (!order) {
        return {
          code: 404,
          success: false,
          message: 'Order not found',
          order: null
        };
      }
      
      order.status = input.status;
      order.updatedAt = new Date();
      
      return {
        code: 200,
        success: true,
        message: 'Order status updated successfully',
        order
      };
    },

    cancelOrder: (_, { orderId }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        return {
          code: 404,
          success: false,
          message: 'Order not found',
          order: null
        };
      }
      
      order.status = 'CANCELLED';
      order.updatedAt = new Date();
      
      return {
        code: 200,
        success: true,
        message: 'Order cancelled successfully',
        order
      };
    },

    confirmOrder: (_, { orderId }) => {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        return {
          code: 404,
          success: false,
          message: 'Order not found',
          order: null
        };
      }
      
      order.status = 'CONFIRMED';
      order.paymentStatus = 'SUCCEEDED';
      order.updatedAt = new Date();
      
      return {
        code: 200,
        success: true,
        message: 'Order confirmed successfully',
        order
      };
    }
  },

  Order: {
    __resolveReference: (reference) => {
      return orders.find(order => order.id === reference.id);
    },
    
    guest: (order) => ({ id: order.guestId }),
    listing: (order) => ({ id: order.listingId })
  }
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers })
});

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4110 }
  });
  
  console.log(`🚀 Orders subgraph ready at ${url}`);
}

startServer().catch(console.error);