
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
    addAmenityToListing: async (_, { listingId, amenityId }, { dataSources }) =>
      dataSources.listingService.addAmenityToListing(listingId, amenityId),
  },

  Listing: {
    amenities: async (listing, __, { dataSources }) => dataSources.amenityService.getAmenitiesByListingId(listing.id),
  },
};
export default resolvers;