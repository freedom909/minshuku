const { AuthenticationError, ForbiddenError } = require('../utils/errors');

const resolvers = {
  
  Query: {
    listing: async ({ id }, _, { dataSources }) => {
      const listings = await dataSources.listingsAPI.getListing(id);
      return listings
    },
    featuredListings: async (_, __, { dataSources }) => {
      const limit=3
      return await dataSources.listingsAPI.getFeaturedListings(limit)
    },
    hostListings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError()
      if (userRole === 'Host') {
        return dataSources.listingsAPI.getFeaturedListings(userId)
      }
      else { throw new ForbiddenError('You are not authorized to perform this action') }
    },
    listingAmenities: async (_, __, { dataSources }) => {
      return dataSources.listingsAPI.getAllAmenities()
    },
    searchListings: async (parent, { criteria }, { dataSources }) => {
      const { numOfBeds, checkInDate, checkOutDate, page, limit, sortBy } = criteria;
      const listings = await dataSources.listingsAPI.getListings({
        numOfBeds, checkInDate, checkOutDate
      });
      if (sortBy) {
        let sortedlistings = [];
        for (let i of Object.keys(listings)) {
          console.log("i", i, "listings[i]", JSON.stringify(listings));
          sortedlistings = [...sortedlistings, ...sortedlistings(listings[i], sortBy)];
        };
      }
      return listings
    },
  },

  Mutation: {
    createListing: async (_, { listing }, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError()
      if (userRole === "Guest") {
        throw Error(`you do not have right to create a listing`)
      }
      try {
        const newListing = await dataSources.listingsAPI.createListing({
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
    //check user role and id
    if (!userId) throw AuthenticationError()
    if (!listingId) throw Error('the listing is not existing')
    try {
      let updatedListing = await dataSources.listingsAPI.updateListing({ ...listing });
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
      return dataSources.listingsAPI.getListing(id)
    },
    host: ({ hostId }) => {
      return { id: hostId }
    },
    totalCost: async (_, { listingId, checkInDate, checkOutDate }, { dataSources }) => {
      const { cost } = await dataSources.listingsAPI.calculateTotalCost({ listingId, checkInDate, checkOutDate });
      return cost
    },
    amenities: async ({ id }, _, { dataSources }) => {
      const amenityList = await dataSources.listingsAPI.getListing(id);
      return amenityList.amenities

    },
    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getCurrentlyBookedDateRangesForListing(id)
    },
    bookings: ({ id }, _, { dataSources }) => {
      console.log("BOOKINGS", args, "LIMIT", limit);
      return dataSources.bookingsAPI.getBookingsForListing(id)
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const numberOfUpComingBooking = await dataSources.bookingsAPI.getBookingsForListing(id, "UPCOMING") || []
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
      return dataSources.reviewsAPI.getAllReviewsByListingID(id);
    }
  }
};
module.exports = resolvers;
