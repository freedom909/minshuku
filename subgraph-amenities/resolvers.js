
const resolvers = {
  Query: {
    listings: async (_, __, { dataSources }) => {
      const { listingService } = dataSources;
      return await listingService.getAllListings();
    },
    listing: async (_, { id }, { dataSources }) => {
      const { listingService } = dataSources;
      return await listingService.getListingById(id);
    },

    amenities: async (_, __, { dataSources }) => {
      const { amenityService } = dataSources;
      return await amenityService.getAllAmenities();
    },
    amenity: async (_, { id }, { dataSources }) => {
      const { amenityService } = dataSources;
      return await amenityService.getAmenityById(id);
    },
  },
  Mutation: {
    addAmenity: async (_, { name }, { dataSources }) => {
      const { amenityService } = dataSources;
      return amenityService.addAmenity(name, categoryId)
    },
    addAmenityToListing: async (_, { listingId, amenityId }, { dataSources }) => {
      const { amenityService,listingService } = dataSources;
      
      if (listingId && amenityId) {
        const amenity = await amenityService.getAmenityById(amenityId);
        if (!amenity) {
          throw new Error('Amenity not found');
        }
        const listing = await listingService.getListingById(listingId);
        if (!listing) {
          throw new Error('Listing not found');
        }
        listing.amenities.push(amenity);
        await listing.save();
        return listing;
      }

      throw new Error('Both listingId and amenityId are required');
    }
  },
  Listing: {
    amenities: async (listing, __, { dataSources }) => {
      const { amenityService } = dataSources;
      return amenityService.getAmenitiesByListingId(listing.id);
    }
  }
};
export default resolvers;