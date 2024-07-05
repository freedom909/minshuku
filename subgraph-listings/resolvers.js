import af from 'date-fns/locale/af/index.js';
import errors from '../utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors;

const resolvers = {
  Query: {
    listing: async (_, { id }, { dataSources }) => {
      const {listingService}=dataSources
      return await listingService.getListing(id);
    },
    featuredListings: async (_, __, { dataSources }) => {
      const {listingService}=dataSources
      const limit = 3;
      return await listingService.getFeaturedListings(limit);
    },
    hostListings: async (_, __, { dataSources, userId, userRole }) => {
      const {listingService}=dataSources
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Host') {
        return listingService.getListingsForUser(userId);
      } else {
        throw new ForbiddenError('You are not authorized to perform this action');
      }
    },
    listingAmenities: (_, __, { dataSources }) => {
      const {listingService}=dataSources
      return listingService.getAllAmenities();
    },
    searchListings: async (_, { criteria }, { dataSources }) => {
      const {listingService}=dataSources
      const { numOfBeds, checkInDate, checkOutDate, page, limit, sortBy } = criteria;
      const listings = await listingService.getListings({
        numOfBeds,
        page,
        limit,
        sortBy
      });
      const listingAvailability = await Promise.all(
        listings.map(listing =>
          bookingService.isListingAvailable({
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
      const {listingService}=dataSources
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        throw new Error('You do not have the right to create a listing');
      }
      const { title, description, photoThumbnail, numOfBeds, costPerNight, locationType, amenities } = listing;
      try {
        const newListing = await listingService.createListing({
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
      const {listingService}=dataSources
      if (!userId) throw new AuthenticationError();
      if (!listingId) throw new Error('The listing does not exist');
      try {
        const updatedListing = await listingService.updateListing({
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
      const {listingService}=dataSources
      return await listingService.getListing(id);
    },
    host: ({ hostId }) => {
      return { id: hostId };
    },
    totalCost: async ({ id }, { checkInDate, checkOutDate }, { dataSources }) => {
      const {listingService}=dataSources
      const { cost } = await listingService.getTotalCost({
        id,
        checkInDate,
        checkOutDate
      });
      return cost;
    },
    amenities: async ({ id }, _, { dataSources }) => {
      const {listingService}=dataSources
      const listing = await listingService.getListing(id);
      if (!listing) throw new Error('Listing not found');
      return listing.amenities.map(amenity => ({
        ...amenity,
        category: amenity.category.replace(' ', '_').toUpperCase(),
        name: amenity.name.replace(' ', '_').toUpperCase()
      }));
    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      const {listingService,bookingService}=dataSources // 'listingService' is declared but its value is never read.
      return bookingService.getCurrentlyBookedDateRangesForListing(id);
    },
    bookings: ({ id }, _, { dataSources }) => {
      const {listingService,bookingService}=dataSources
      return bookingService.getBookingsForListing(id);
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const {listingService,bookingService}=dataSources
      const bookings = await bookingService.getBookingsForListing(id, 'UPCOMING') || [];
      return bookings.length;
    },
    coordinates: ({ id }, _, { dataSources }) => {
      const {listingService}=dataSources
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
