
import { GraphQLError } from 'graphql';
import DateTimeType from '../infrastructure/scalar/dateTimeType.js';
import { authenticateJWT, checkPermissions } from '../infrastructure/middleware/auth.js';
import { permissions } from '../infrastructure/auth/permission.js';
import fs from 'fs';
import path from 'path';


// Scalar resolvers
const resolvers = {
  DateTime: DateTimeType,

  // Query resolvers
  Query: {
    getUser: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      const user = await accountService.getUserById(id);
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return user;
    },
    getListingByHost: async (_, __, { dataSources, user }) => {
      const { listingService } = dataSources;

      if (!user) throw new GraphQLError('You must be logged in to view your listing', { extensions: { code: 'UNAUTHENTICATED' } });

      if (user.role === 'HOST') {
        const listings = await listingService.getListingsForHost(user.id);
        if (listings) {
          return listings;
        }
        throw new GraphQLError('No listings found for this host', { extensions: { code: 'NO_LISTINGS_FOUND' } });
      } else {
        throw new GraphQLError('You are not authorized to view listings', { extensions: { code: 'UNAUTHORIZED' } });
      }
    },
    user: async (_, { id }) => {
      const { accountService } = dataSources;
      const user = await accountService.getUserById(id);
      if (!user) {
        throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      }
      return user;
    },
    me: async (_, __, { dataSources, userId }) => {
      const { accountService } = dataSources;
      if (!userId) throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      return accountService.getUserById(userId);
    },
    viewer: async (_, __, { dataSources, user }) => {
      const { accountService } = dataSources;
      if (user?.sub) {
        return accountService.getAccountById(user.sub);
      }
      return null;
    },

    account: async (_, { id }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getAccountById(id);
    },
    accounts: async (_, __, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.getAllAccounts();
    },
    cart: async (_, __, { user }) => {
      const { cartService } = dataSources;
      return cartService.getCartByUser(user);
    },
    carts: async () => {
      const { cartService } = dataSources;
      return cartService.getAllCarts();
    },
    reviews: async (_, { listingId }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewsByListingId(listingId);
    },
    host: async (_, { id }) => {
      const { accountService } = dataSources;
      return accountService.getHostById(id);
    },


    location: async (_, { id }) => {
      const { locationService } = dataSources;
      return locationService.getLocationById(id);
    },
    _service: () => {
      const sdl = [
        fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, './schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, '../subgraph-carts/schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, '../subgraph-bookings/schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, '../subgraph-listings/schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, '../subgraph-locations/schema.graphql'), 'utf-8'),
        // fs.readFileSync(path.join(__dirname, '../subgraph-reviews/schema.graphql'), 'utf-8'),

        // Add more SDLs as needed

        // Add more SDLs as needed
      ].join('\n'); // Combine the contents into a single string

      return { sdl };
    }, // For Apollo Federation _service query

    _entities: async (_, { representations }, { dataSources }) => {
      return representations.map(representation => {
        switch (representation.__typename) {
          case 'User':
            return dataSources.userService.getUserById(representation.id);
          case 'Booking':
            return dataSources.bookingService.getBookingById(representation.id);
          case 'Listing':
            return dataSources.listingService.getListingById(representation.id);
          case 'Cart':
            return dataSources.cartService.getCartById(representation.id);
          case 'Review':
            return dataSources.reviewService.getReviewById(representation.id);
          case 'Host':
            return dataSources.userService.getHostById(representation.id);
          case 'Location':
            return dataSources.listingService.getLocationById(representation.id);
          // Add more resolvers as needed
          default:
            return null; // Handle more types as needed
        }
      });
    },
  },

  // Mutation resolvers
  Mutation: {
    createAccount: async (_, { input: { email, password } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.createAccount(email, password);
    },
    updateAccountEmail: async (_, { input: { id, email } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateAccountEmail(id, email);
    },
    updateAccountPassword: async (_, { input: { id, newPassword, password } }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateAccountPassword(id, newPassword, password);
    },

    cancelListing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.updateListingStatus(id, 'CANCELLED');
    },

    updateProfile: async (_, { id, input }, { dataSources }) => {
      const { accountService } = dataSources;
      return accountService.updateUser(id, input);
    },

    signOut: (_, __, context) => {
      if (context.session) {
        context.session.destroy(err => {
          if (err) {
            throw new GraphQLError('Failed to terminate the session', { extensions: { code: 'FAILED_TO_TERMINATE_SESSION' } });
          }
        });
      }
      return true;
    },
  },
  _service: {
    createListing: async (_, { title, description, price, locationId, hostId }, { dataSources, user }) => {
      const { listingService } = dataSources;
      if (!user || user.role !== 'HOST') {
        throw new GraphQLError('You do not have the right to create a listing', { extensions: { code: 'UNAUTHORIZED' } });
      }
      if (!locationId) {
        throw new GraphQLError('You must select a location', { extensions: { code: 'LOCATION_REQUIRED' } });
      }
      const newListing = await listingService.createListing({ title, description, price, locationId, hostId });
      return newListing;
    },
  },

  // Union and interface resolvers
  _Entity: {
    __resolveType(entity) {
      if (entity.__typename === 'Listing') return 'Listing';
      if (entity.__typename === 'Host') return 'Host';
      if (entity.__typename === 'Guest') return 'Guest';
      if (entity.__typename === 'Booking') return 'Booking';
      if (entity.__typename === 'Cart') return 'Cart';
      return null;
    }
  },

  User: {
    __resolveType(user) {
      if (user.role === 'HOST') return 'Host';
      if (user.role === 'GUEST') return 'Guest';
      return null;
    }
  },

  // Field-specific resolvers
  Host: {
    listings: (host) => getListingsById(host.id),
    overallRating: (host) => getOverallRatingForHost(host.id),
  },

  Guest: {
    getBookingByGuest: async (_, __, { dataSources, user }) => {
      const guestId = user?.id
      if (!guestId) throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      const { bookingService } = dataSources;
      return bookingService.getBookingByUser(guestId);
    },
    bookingHistory: async (_, __, { dataSources, user }) => {
      const guestId = user?.id
      if (!guestId) throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
      const { bookingService } = dataSources;
      return bookingService.getBookingHistoryByUser(guestId);
    },
    listings: (guest) => getBookingsByUser(guest.id).map(booking => booking.listing),
  },
  reviews: (guest) => getReviewsByUser(guest.id),

  carts: (guest) => getCartsByUser(guest.id),
  items: (cart) => getItemsByCart(cart.id),

  Review: {
    userId: (review) => review.userId,
    listingId: (review) => review.listingId,
  },
  Listing: {
    location: (listing) => getLocationByListing(listing.id),
    latitude: (listing) => listing.latitude,
    longitude: (listing) => listing.longitude,
  },

  CartItem: {
    listing: (cartItem) => getListingById(cartItem.listingId),
  },
};

export default resolvers;
