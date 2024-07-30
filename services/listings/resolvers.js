import { AuthenticationError, ForbiddenError } from '../../infrastructure/utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

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
    // Resolver for fetching all listings
    listings: async (_, __, { dataSources }) => {
      return await dataSources.listingService.getAllListings();
    },

    // Resolver for fetching a single listing by ID
    listing: async (_, { id }, { dataSources }) => {
      return dataSources.listingService.getListingById(id);
    },

    featuredListings: async (_, __, { dataSources }) => {
      return await dataSources.listingService.getFeaturedListings()
    },
    hostListings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError()
      if (userRole === 'Host') {
        return dataSources.listingService.getFeaturedListings(userId)
      }
      else { throw new ForbiddenError('You are not authorized to perform this action') }
    },
    listingAmenities: async (_, __, { dataSources }) => {
      return dataSources.listingService.getAllAmenities()
    },
    searchListings: async (_, { criteria }, { dataSources }) => {
      const { listingService } = dataSources;
      const { numOfBeds, reservedDate, page, limit, sortBy } = criteria;
      const listings = await listingService.searchListings({
        numOfBeds, reservedDate, page, limit, sortBy
      });
      if (sortBy) {
        listings.sort((a, b) => {
          if (sortBy === 'COST_ASC') {
            return a.costPerNight - b.costPerNight;
          }
          return b.costPerNight - a.costPerNight;
        });
      }
      return listings;
    },
    
  },

  Mutation: {
    createListing: async (_, { listing }, { dataSources, userId, userRole }) => {
      const {listingService} = dataSources
      if (!userId) throw AuthenticationError()
      if (userRole === "Guest") {
        throw Error(`you do not have right to create a listing`)
      }
      try {
        const newListing = await listingService.createListing({
          title,
          description,
          photoThumbnail,
          numOfBeds,
          costPerNight,
          hostId: userId,
          locationType,
          amenities,
        });

        return {
          code: 200,
          success: true,
          message: "Listing successfully created!",
          listing: newListing,
        };
      } catch (err) {
        console.log(err);
        return {
          code: 400,
          success: false,
          message: err.message,
        }
      }
    }
  },
  updateListing: async (_, { listingId, listing }, { dataSources, userId }) => {
    const { listingService } = dataSources;
    //check user role and id
    if (!userId) throw AuthenticationError()
    if (!listingId) throw Error('the listing is not existing')
    try {
      let updatedListing = await listingService.updateListing({ ...listing });
      return {
        code: 201,
        success: true,
        message: 'successfully updated',
        updatedListing
      }

    } catch (error) {
      return {
        code: 400,
        success: false,
        message: "error.message"
      }

    }
  },
  Listing: {
    __resolverReference: ({ id }, _, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.getListing(id)
    },
    host: ({ hostId }) => {
      return { id: hostId }
    },
    totalCost: async (_, { listingId, checkInDate, checkOutDate }, { dataSources }) => {
      const { listingService } = dataSources;
      const { cost } = await listingService.calculateTotalCost({ listingId, checkInDate, checkOutDate });
      return cost
    },
    amenities: async ({ id }, _, { dataSources }) => {
      const {listingService } = dataSources;
      const amenityList = await listingService.getListing(id);
      return amenityList.amenities

    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      return bookingService.getCurrentlyBookedDateRangesForListing(id)
    },
    bookings: ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      console.log("BOOKINGS", args, "LIMIT", limit);
      return bookingService.bookingsAPI.getBookingsForListing(id)
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const { bookingService } = dataSources;
      const numberOfUpComingBooking = await bookingService.getBookingsForListing(id, "UPCOMING") || []
      return numberOfUpComingBooking.length
    },
    coordinates: ({ id }, _, { dataSources }) => {
      //console.log("COORDINATES");
      return dataSources.locationsAPI.getLocationForListing(id)
    },
    AmenityCategory: {
      ACCOMMODATION_DETAILS: "Accommodation Details",
      SPACE_SURVIVAL: "Space survival",
      OUTDOORS: "Outdoors"
    },


    reviews: ({ id }, _, { dataSources }) => {
      const {reviewsService } = dataSources;
      return bookingService.getAllReviewsByListingID(id);
    }
  }
};
export default resolvers;

