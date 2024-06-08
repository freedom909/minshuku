import af from 'date-fns/locale/af/index.js';
import errors from '../utils/errors.js'
const { AuthenticationError, ForbiddenError } = errors
const resolvers = {
  Query: {
    listing: async (_, { id }, { dataSources }) => {
      const listings = await dataSources.listingsAPI.getListing(id)
      return listings
    },
    featuredListings: async (_, __, { dataSources }) => {
      const limit = 3
      return await dataSources.listingsAPI.getFeaturedListings(limit)
    },
    hostListings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError()
      if (userRole === 'Host') {
        return dataSources.listingsAPI.getListingsForUser(userId)
      } else {
        throw new ForbiddenError(
          'You are not authorized to perform this action'
        )
      }
    },
    listingAmenities: (_, __, { dataSources }) => {
      return dataSources.listingsAPI.getAllAmenities();
    },
    searchListings: async (_, { criteria }, { dataSources }) => {
      const { numOfBeds, checkInDate, checkOutDate, page, limit, sortBy } =
        criteria
      const listings = await dataSources.listingsAPI.getListings({
        numOfBeds,
        page,
        limit,
        sortBy
      })
      // if (sortBy) {
      //   let sortedlistings = [];
      //   for (let i of Object.keys(listings)) {
      //     console.log("i", i, "listings[i]", JSON.stringify(listings));
      //     sortedlistings = [...sortedlistings, ...sortedlistings(listings[i], sortBy)];
      //   };
      // }
      // return listings
      const listingAvailability = await Promise.all(
        listings.map(listing =>
          dataSources.bookingsAPI.isListingAvailable({
            listingId: listing.id,
            checkInDate,
            checkOutDate
          })
        )
      )
      //fitler listings data based on availablity
      const filteredListings = listings.filter((listing, index) => {
        return listingAvailability[index]
      })
      return filteredListings
    }
  },

  Mutation: {
    createListing: async (
      _,
      { listing },
      { dataSources, userId, userRole }
    ) => {
      if (!userId) throw AuthenticationError()
      if (userRole === 'Guest') {
        throw Error(`you do not have right to create a listing`)
      }
      const {
        title,
        description,
        photoThumbnail,
        numOfBeds,
        costPerNight,
        locationType,
        amenities
      } = listing
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
        })

        return {
          code: 200,
          success: true,
          message: 'Listing successfully created!',
          listing: newListing
        }
      } catch (err) {
        console.log(err)
        return {
          code: 400,
          success: false,
          message: err.message
        }
      }
    }
  },
  updateListing: async (_, { listingId, listing }, { dataSources, userId }) => {
    //check user role and id
    if (!userId) throw AuthenticationError()
    if (!listingId) throw Error('the listing is not existing')
    try {
      let updatedListing = await dataSources.listingsAPI.updateListing({
        ...listing
      })
      return {
        code: 201,
        success: true,
        message: 'successfully updated',
        updatedListing
      }
      //       return {code : 503 ,success :false}
    } catch (error) {
      return {
        code: 503,
        success: false,
        message: error.message
      }
    }
  },
  Listing: {
    __resolverReference: ({ id }, { dataSources }) => {
      return dataSources.listingsAPI.getListing(id)
    },
    host: ({ hostId }) => {
      return { id: hostId }
    },
    totalCost: async (
      { id },
      { checkInDate, checkOutDate },
      { dataSources }
    ) => {
      const { cost } = await dataSources.listingsAPI.getTotalCost({
        id,
        checkInDate,
        checkOutDate
      })
      return cost
    },

    amenities:async ({ id }, _, { dataSources }) => {
      const list = await dataSources.listingsAPI.getListing(id);
   
      if (!list) {
          return new Error('Listing not found');
      }
  
     // Transform amenities to use enum values
      const transformedAmenities = list.amenities.map(amenity => {
          // Check if amenity is an object
          if (typeof amenity === 'object') {
              // If it is, return the object
              return amenity;
          }
            // Check if amenityList is an array
      // if (Array.isArray(amenity)) {
      //   // If it's an array, find the listing with the matching id
      //   const amenityList = amenity.find (item => item.id === amenity.id);
      //   return amenityList;
      //   }
        // Return the result of the above function
      //   return amenityList.amenities;
      // })
     
          const categoryEnumValue = amenity.category?.replace(' ', '_').toUpperCase();
          const nameEnumValue = amenity.name?.replace(' ', '_').toUpperCase();
          const amenityEnumValue = `${categoryEnumValue}_${nameEnumValue}`;
  
          return {
              id: amenity.id,
              category: categoryEnumValue,
              name: nameEnumValue,
              amenity: amenityEnumValue
          }
      });
      return transformedAmenities;
    
  },
    
  
    //   // Check if amenityList is an array
    //   if (Array.isArray(amenity)) {
    //     // If it's an array, find the listing with the matching id
    //     const listing = amenityList.find((listing) => listing.id === id);
    //     if (!listing) {
    //       return []; // Return an empty array if listing is not found
    //     }

    //       console.log({transformedAmenities});
    //     return transformedAmenities;
    //   }
      
    //   //If amenityList is not an array, return the amenities directly
    //   return amenityList.amenities;
    // },
    

    currentlyBookedDates: ({ id }, _, { dataSources }) => {
      return dataSources.bookingsAPI.getCurrentlyBookedDateRangesForListing(id)
    },
    bookings: ({ id }, _, { dataSources }) => {
      console.log('BOOKINGS', args, 'LIMIT', limit)
      return dataSources.bookingsAPI.getBookingsForListing(id)
    },
    numberOfUpcomingBookings: async ({ id }, _, { dataSources }) => {
      const numberOfUpComingBooking =
        (await dataSources.bookingsAPI.getBookingsForListing(id, 'UPCOMING')) ||
        []
      return numberOfUpComingBooking.length
    },
    coordinates: ({id}, _,{ dataSources }) => {
      return dataSources.listingsAPI.getListingCoordinates(id)
    },
    AmenityCategory: {
      ACCOMMODATION_DETAILS: 'ACCOMMODATION_DETAILS',
      SPACE_SURVIVAL: 'SPACE_SURVIVAL',
      OUTDOORS: 'OUTDOORS'
    },
    
   
  }
}

export default resolvers
