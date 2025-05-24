import { ApolloServer, gql } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/federation';
import { SubgraphAuthService, createSubgraphServer } from './subgraphAuth.js';

// Example: User Service Subgraph
const userServiceExample = () => {
  // Type definitions with auth directives
  const typeDefs = gql`
    extend type Query {
      # Public endpoint - no auth required
      publicUsers: [User]

      # Protected endpoint - requires authentication
      me: User @auth(requires: { auth: true })

      # Admin only endpoint
      allUserDetails: [UserDetails] @auth(requires: { role: "ADMIN" })
    }

    type User @key(fields: "id") {
      id: ID!
      username: String!
      email: String! @auth(requires: { auth: true })
      role: String! @auth(requires: { auth: true })
    }

    type UserDetails {
      user: User!
      loginHistory: [LoginRecord] @auth(requires: { permission: "VIEW_HISTORY" })
      securitySettings: SecuritySettings @auth(requires: { permission: "MANAGE_SECURITY" })
    }

    type LoginRecord {
      timestamp: String!
      ipAddress: String!
      device: String!
    }

    type SecuritySettings {
      twoFactorEnabled: Boolean!
      lastPasswordChange: String!
      activeDevices: [String!]!
    }
  `;

  // Resolvers with auth checks
  const resolvers = {
    Query: {
      publicUsers: async () => {
        // Public endpoint - returns limited user data
        return [
          { id: '1', username: 'public_user1' },
          { id: '2', username: 'public_user2' },
        ];
      },

      me: async (_, __, context) => {
        // Protected endpoint - requires auth
        const { user } = context;
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
      },

      allUserDetails: async (_, __, context) => {
        // Admin only endpoint
        // Auth directive handles role check
        return [
          {
            user: { id: '1', username: 'user1', email: 'user1@example.com', role: 'USER' },
            loginHistory: [
              {
                timestamp: '2023-01-01T00:00:00Z',
                ipAddress: '192.168.1.1',
                device: 'Chrome/Windows',
              },
            ],
            securitySettings: {
              twoFactorEnabled: true,
              lastPasswordChange: '2023-01-01T00:00:00Z',
              activeDevices: ['Chrome/Windows', 'Mobile/iOS'],
            },
          },
        ];
      },
    },

    User: {
      // Reference resolver for federation
      __resolveReference: async (reference) => {
        // Fetch user by id
        return { id: reference.id, username: 'resolved_user' };
      },
    },
  };

  // Create the subgraph server with auth
  return createSubgraphServer(typeDefs, resolvers, {
    jwtSecret: process.env.JWT_SECRET,
    allowedServices: ['booking-service', 'listing-service'],
  });
};

// Example: Booking Service Subgraph
const bookingServiceExample = () => {
  const typeDefs = gql`
    extend type Query {
      # Protected endpoint - requires authentication
      myBookings: [Booking] @auth(requires: { auth: true })
      
      # Host only endpoint
      hostBookings: [Booking] @auth(requires: { role: "HOST" })
    }

    type Booking @key(fields: "id") {
      id: ID!
      user: User! @auth(requires: { auth: true })
      listing: Listing!
      startDate: String!
      endDate: String!
      status: BookingStatus!
      # Only visible to booking owner or admin
      paymentDetails: PaymentDetails @auth(requires: { permission: "VIEW_PAYMENT_DETAILS" })
    }

    type PaymentDetails {
      amount: Float!
      status: String!
      method: String!
    }

    enum BookingStatus {
      PENDING
      CONFIRMED
      CANCELLED
    }

    # Reference the User type from user-service
    extend type User @key(fields: "id") {
      id: ID! @external
      bookings: [Booking] @auth(requires: { auth: true })
    }

    # Reference the Listing type from listing-service
    extend type Listing @key(fields: "id") {
      id: ID! @external
      bookings: [Booking] @auth(requires: { role: "HOST" })
    }
  `;

  const resolvers = {
    Query: {
      myBookings: async (_, __, context) => {
        const { user } = context;
        // Return bookings for authenticated user
        return [
          {
            id: '1',
            userId: user.id,
            listingId: 'listing1',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
            status: 'CONFIRMED',
          },
        ];
      },

      hostBookings: async (_, __, context) => {
        const { user } = context;
        // Return bookings for host's listings
        return [
          {
            id: '2',
            userId: 'guest1',
            listingId: 'host-listing-1',
            startDate: '2024-02-01',
            endDate: '2024-02-07',
            status: 'PENDING',
          },
        ];
      },
    },

    Booking: {
      user: (booking) => {
        // Return reference to User type
        return { __typename: 'User', id: booking.userId };
      },

      listing: (booking) => {
        // Return reference to Listing type
        return { __typename: 'Listing', id: booking.listingId };
      },

      paymentDetails: async (booking, _, context) => {
        const { user } = context;
        
        // Custom authorization logic
        if (user.id !== booking.userId && user.role !== 'ADMIN') {
          return null;
        }

        return {
          amount: 100.00,
          status: 'PAID',
          method: 'CREDIT_CARD',
        };
      },
    },

    User: {
      bookings: async (user, _, context) => {
        // Return bookings for user
        if (context.user.id !== user.id && context.user.role !== 'ADMIN') {
          return null;
        }

        return [
          {
            id: '1',
            userId: user.id,
            listingId: 'listing1',
            startDate: '2024-01-01',
            endDate: '2024-01-07',
            status: 'CONFIRMED',
          },
        ];
      },
    },

    Listing: {
      bookings: async (listing, _, context) => {
        // Verify host permissions
        const { user } = context;
        // This would typically check if the user is the host of this listing
        return [
          {
            id: '2',
            userId: 'guest1',
            listingId: listing.id,
            startDate: '2024-02-01',
            endDate: '2024-02-07',
            status: 'PENDING',
          },
        ];
      },
    },
  };

  // Create the subgraph server with auth
  return createSubgraphServer(typeDefs, resolvers, {
    jwtSecret: process.env.JWT_SECRET,
    allowedServices: ['user-service', 'listing-service'],
  });
};

// Example usage
const startServices = async () => {
  try {
    const userService = userServiceExample();
    const bookingService = bookingServiceExample();

    await userService.listen({ port: 4010 });
    console.log('User service ready at http://localhost:4010');

    await bookingService.listen({ port: 4002 });
    console.log('Booking service ready at http://localhost:4002');
  } catch (error) {
    console.error('Error starting services:', error);
  }
};

// Only start services if this file is run directly
if (require.main === module) {
  startServices();
}

export { userServiceExample, bookingServiceExample };