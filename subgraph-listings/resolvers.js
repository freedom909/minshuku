import af from 'date-fns/locale/af/index.js';
import errors from '../utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors;

const resolvers = {
  Query: {
    listing: async (_, { id }, { dataSources }) => {
      return await dataSources.listingsAPI.getListing(id);
    },
    featuredListings: async (_, __, { dataSources }) => {
      const limit = 3;
      return await dataSources.listingsAPI.getFeaturedListings(limit);
    },
    hostListings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Host') {
        return dataSources.listingsAPI.getListingsForUser(userId);
      } else {
        throw new ForbiddenError('You are not authorized to perform this action');
      }
    },
    listingAmenities: (_, __, { dataSources }) => {
      return dataSources.listingsAPI.getAllAmenities();
    },
    searchListings: async (_, { criteria }, { dataSources }) => {
      const { numOfBeds, checkInDate, checkOutDate, page, limit, sortBy } = criteria;
      const listings = await dataSources.listingsAPI.getListings({
        numOfBeds,
        page,
        limit,
        sortBy
      });
      const listingAvailability = await Promise.all(
        listings.map(listing =>
          dataSources.bookingsAPI.isListingAvailable({
            listingId: listing.id,
            checkInDate,
            checkOutDate
          })
        )
      );
      const filteredListings = listings.filter((listing, index) => listingAvailability[index]);
      return filteredListings;
    }
  },

  Mutation: {
    createListing: async (_, { listing }, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        throw new Error('You do not have the right to create a listing');
      }
      const { title, description, photoThumbnail, numOfBeds, costPerNight, locationType, amenities } = listing;
      try {
        const newListing = await dataSources.listingsAPI.createListing({
          title,
          description,
          photoThumbnail,
          numOfBeds,
          costPerNight,
          hostId: userId,
          locationType,
          amenities
        });

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
      if (!userId) throw new AuthenticationError();
      if (!listingId) throw new Error('The listing does not exist');
      try {
        const updatedListing = await dataSources.listingsAPI.updateListing({
          ...listing,
          id: listingId
        });
        return {
          code: 201,
          success: true,
          message: 'Successfully updated',
          listing: updatedListing
        };
      } catch (error) {
        return {
          code: 503,
          success: false,
          message: error.message
        };
      }
    }
  },

  Listing: {
    __resolveReference: async ({ id }, { dataSources }) => {
      return await dataSources.listingsAPI.getListing(id);
    },
    host: ({ hostId }) => {
      return { id: hostId };
    },
    totalCost: async ({ id }, { checkInDate, checkOutDate }, { dataSources }) => {
      const { cost } = await dataSources.listingsAPI.getTotalCost({
        id,
        checkInDate,
        checkOutDate
      });
      return cost;
    },
    amenities: async ({ id }, _, { dataSources }) => {
      const listing = await dataSources.listingsAPI.getListing(id);
      if (!listing) throw new Error('Listing not found');
      return listing.amenities.map(amenity => ({
        ...amenity,
        category: amenity.category.replace(' ', '_').toUpperCase(),
        name: amenity.name.replace(' ', '_').toUpperCase()
      }));
    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getCurrentlyBookedDateRangesForListing(id);
    },
    bookings: ({ id }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getBookingsForListing(id);
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const bookings = await dataSources.bookingsAPI.getBookingsForListing(id, 'UPCOMING') || [];
      return bookings.length;
    },
    coordinates: ({ id }, _, { dataSources }) => {
      return dataSources.listingsAPI.getListingCoordinates(id);
    }
  },

  AmenityCategory: {
    ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
    SPACE_SURVIVAL: 'SPACE_SURVIVAL',
    OUTDOORS: 'OUTDOORS'
  }
};

export default resolvers;
