

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
    amenity: async (_, { locationId }, { dataSources }) => {
      const { amenityService } = dataSources;
      return await amenityService.getAmenityById(locationId);
    },
  },
  Mutation: {
    addAmenity: async (_, { input }, { dataSources }) => {
      const { amenityService } = dataSources;
      const { name, categoryId, description, locationId } = input;
      return await amenityService.addAmenity(name, categoryId, description, locationId)
    },
    addAmenityToListing: async (_, { listingId, amenityId }, { dataSources }) =>
      dataSources.listingService.addAmenityToListing(listingId, amenityId),
  },
  Amenity: {
    __resolveReference: async (reference, { dataSources }) => {
      return await dataSources.amenityService.getAmenityById(reference.id);
    },
     id: (a) => a.id,
    name: (a) => a.name,
    locationId: (a) => a.locationId,
    category: (a) => a.category,
    description: (a) => a.description,
  },
  Listing: {
    __resolveReference: async (reference, { dataSources }) => {
      return await dataSources.listingService.getListingById(reference.id);
    },
    amenities: async (listing, __, { dataSources }) => dataSources.amenityService.getAmenitiesById(listing.amenityIds),
  },
};
export default resolvers;