import { AuthenticationError, ForbiddenError} from '../infrastructure/utils/errors.js';

const resolvers = {
  Query: {
    hostListings: () => {
      return [
        {
          description: "Cozy apartment",
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        },
        {
          description: "Beach house",
          coordinates: { latitude: 34.0194, longitude: -118.4912 }
        }
      ];
    },

    hotListingsByMoney: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      try {
        const listings = await listingService.hotListingsByMoneyBookingTop5();
        return listings;
      } catch (error) {
        throw new Error('Failed to fetch hot listings by money');
      }
    },

    hotListingsByBookingNumber: async (_,__,{dataSources}) => {
      const {listingService} =dataSources
      return listingService.getListingsByNumberBooking();
    },
    
    listing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return await listingService.getListing(id);
    },
    featuredListings: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      const limit = 3;
      return await listingService.getFeaturedListings(limit);
    },
    hotListings: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;      
        return listingService.getTop5Listings();
    },

    listingAmenities: (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getAllAmenities();
    },
    searchListings: async (_, { criteria }, { dataSources }) => {
      const { listingService, bookingService } = dataSources;
      const { numOfBeds, checkInDate, checkOutDate, page, limit, sortBy } = criteria;
      const listings = await listingService.getListings({ numOfBeds, page, limit, sortBy });
      const listingAvailability = await Promise.all(
        listings.map(listing =>
          bookingService.isListingAvailable({ listingId: listing.id, checkInDate, checkOutDate })
        )
      );
      return listings.filter((listing, index) => listingAvailability[index]);
    }
  },

  Mutation: {
    createListing: async (_, { listing }, { dataSources, userId, userRole }) => {
      const { listingService } = dataSources;
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (userRole === 'Guest') {
        throw new ForbiddenError('You do not have the right to create a listing');
      }
      try {
        const newListing = await listingService.createListing({ ...listing, hostId: userId });
        return {
          code: 200,
          success: true,
          message: 'Listing successfully created!',
          listing: newListing
        };
      } catch (err) {
        console.error(err);
        return {
          code: 400,
          success: false,
          message: err.message
        };
      }
    },
    updateListing: async (_, { listingId, listing }, { dataSources, userId }) => {
      const { listingService } = dataSources;
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (!listingId) throw new Error('Listing ID not provided');
      try {
        const updatedListing = await listingService.updateListing({ ...listing, id: listingId });
        return {
          code: 200,
          success: true,
          message: 'Listing successfully updated',
          listing: updatedListing
        };
      } catch (error) {
        console.error(error);
        return {
          code: 500,
          success: false,
          message: error.message
        };
      }
    }
  },

  Listing: {
    __resolveReference: async ({ id }, { dataSources }) => {
      const { listingService } = dataSources;
      return await listingService.getListing(id);
    },
    host: ({ hostId }) => {
      return { id: hostId };
    },
    totalCost: async ({ id }, { checkInDate, checkOutDate }, { dataSources }) => {
      const { listingService } = dataSources;
      const { cost } = await listingService.getTotalCost({ id, checkInDate, checkOutDate });
      return cost;
    },
    amenities: async ({ id }, _, { dataSources }) => {
      const { listingService } = dataSources;
      const listing = await listingService.getListing(id);
      if (!listing) throw new Error('Listing not found');
      return listing.amenities.map(amenity => ({
        ...amenity,
        category: amenity.category.replace(' ', '_').toUpperCase(),
        name: amenity.name.replace(' ', '_').toUpperCase()
      }));
    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      return bookingService.getCurrentlyBookedDateRangesForListing(id);
    },
    bookings: ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      return bookingService.getBookingsForListing(id);
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      const bookings = await bookingService.getBookingsForListing(id, 'UPCOMING') || [];
      return bookings.length;
    },
    coordinates: ({ id }, _, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getListingCoordinates(id);
    }
  },

  AmenityCategory: {
    ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
    SPACE_SURVIVAL: 'SPACE_SURVIVAL',
    OUTDOORS: 'OUTDOORS'
  }
};

export default resolvers;
