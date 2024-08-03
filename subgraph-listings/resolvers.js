import { AuthenticationError, ForbiddenError } from '../infrastructure/utils/errors.js';
import { permissions } from '../infrastructure/auth/permission.js';
const { listingWithPermissions, isHostOfListing, isAdmin } = permissions;
const resolvers = {

  Query: {
    hotListingsByMoney: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      try {
        const listings = await listingService.hotListingsByMoneyBookingTop5();
        return listings;
      } catch (error) {
        throw new Error('Failed to fetch hot listings by money');
      }
    },

    hotListingsByBookingNumber: async (_, __, { dataSources }) => {
      const { listingService } = dataSources
      try {
        return listingService.hotListingsByNumberBookingTop5();
      } catch (error) {
        throw new Error('Failed to fetch hot listings by booking number');
      }
    },

    listings: async (_, args, { dataSources }) => {
      const { listingService } = dataSources;
      try {
        return await listingService.getListings(args);
      } catch (error) {
        console.error('Error fetching listings:', error);
        throw new Error('Failed to fetch listings');
      }
    },
    listing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      try {
        return await listingService.getListing(id);
      } catch (error) {
        console.error('Error fetching listing:', error);
        throw new Error('Failed to fetch listing');
      }
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
      const listings = await listingService.searchListings({
        numOfBeds,
        checkInDate: reservedDate.checkInDate,
        checkOutDate: reservedDate.checkOutDate,
        page,
        limit,
        sortBy
      });
      const listingAvailability = await Promise.all(
        listings.map(listing =>
          bookingService.isListingAvailable({ listingId: listing.id, checkInDate, checkOutDate })
        )
      );
      return listings.filter((listing, index) => listingAvailability[index]);
    }
  },

  Mutation: {
    createListing: async (_, { listing }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (!listingWithPermissions) {
        throw new AuthenticationError('User does not have permissions to create a listing');
      }

      const { listingService, amenityService } = dataSources;
      const { amenities } = listing;
      if (!amenities || !amenities.length) {
        throw new Error('Listing must have at least one amenity');
      }
      const amenityIds = await amenityService.getAmenityIds(amenities);
      listing.amenities = amenityIds;
      try {
        const newListing = await listingService.createListing({ ...listing, hostId: userId });
        await amenityService.linkAmenitiesToListing(newListing.id, amenityIds);
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
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (!isHostOfListing || !isAdmin) {
        throw new AuthenticationError(`you don't have right to update this list`)
      }
      const { listingService } = dataSources;

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
    },
    deleteListing: async (_, { listingId }, { dataSources, userId }) => {
      if (!userId) throw new AuthenticationError('User not authenticated');
      if (!isHostOfListing || !isAdmin) {
        throw new AuthenticationError(`you don't have right to delete this list`)
      }
      const { listingService } = dataSources;
      if (!listingId) throw new Error('Listing ID not provided');
      try {
        await listingService.deleteListing(listingId);
        return {
          code: 200,
          success: true,
          message: 'Listing successfully deleted'
        };
      } catch (error) {
        console.error(error);
        return {
          code: 500,
          success: false,
          message: error.message
        };
      }
    },
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
      try {
        const listing = await listingService.getListing(id);
        if (!listing) throw new Error('Listing not found');
        const amenities = listing.amenities || [];
        return amenities.map(amenity => ({
          ...amenity,
          category: amenity.category.replace(' ', '_').toUpperCase(),
          name: amenity.name.replace(' ', '_').toUpperCase()
        }));
      } catch (error) {
        console.error(`Error fetching amenities for listing ${id}:`, error);
        throw new Error('Failed to fetch amenities');
      }
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
      return listingService.getCoordinates(id);
    }
  },

  AmenityCategory: {
    ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
    SPACE_SURVIVAL: 'SPACE_SURVIVAL',
    OUTDOORS: 'OUTDOORS'
  }
};

export default resolvers;