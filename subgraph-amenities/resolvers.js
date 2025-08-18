// resolvers/amenityResolvers.js

const resolvers = {
  Query: {
    // Get all amenities
    amenities: async (_, __, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");
      return await amenityService.getAllAmenities();
    },

    // Get a single amenity by ID
    amenity: async (_, { id }, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");
      return await amenityService.getAmenityById(id);
    },

    // Get amenities for a specific listing
    listingAmenities: async (_, { listingId }, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");
      return await amenityService.getAmenitiesByListingId(listingId);
    },
  },

  Mutation: {
    // Add a new amenity
// Resolver
addAmenity: async (_, { input }, { dataSources }) => {
  const amenityService = dataSources.amenityService;
  if (!amenityService) throw new Error("AmenityService is not available");

  const amenity = await amenityService.addAmenity(input);
  return {
    code: 200,
    success: true,
    message: "Amenity created successfully",
    amenity,
  };
},


    // Update an amenity
    updateAmenity: async (_, { id, input }, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");

      try {
        const amenity = await amenityService.updateAmenity(id, input);
        if (!amenity) {
          return {
            code: 404,
            success: false,
            message: "Amenity not found",
            amenity: null,
          };
        }
        return {
          code: 200,
          success: true,
          message: "Amenity updated successfully",
          amenity,
        };
      } catch (error) {
        console.error("Error in updateAmenity:", error);
        return {
          code: 500,
          success: false,
          message: error.message || "Failed to update amenity",
          amenity: null,
        };
      }
    },

    // Delete an amenity
    deleteAmenity: async (_, { id }, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");

      try {
        const deleted = await amenityService.deleteAmenity(id);
        if (!deleted) {
          return {
            code: 404,
            success: false,
            message: "Amenity not found",
          };
        }
        return {
          code: 200,
          success: true,
          message: "Amenity deleted successfully",
        };
      } catch (error) {
        console.error("Error in deleteAmenity:", error);
        return {
          code: 500,
          success: false,
          message: error.message || "Failed to delete amenity",
        };
      }
    },
  },

  // Field resolvers for Amenity
  Amenity: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
    description: (parent) => parent.description,
    locationId: (parent) => parent.locationId,
    category: (parent) => (parent.category ? parent.category : null),

    __resolveReference: async (reference, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");
      return await amenityService.getAmenityById(reference.id);
    },
  },

  // Field resolvers for Listing
  Listing: {
    __resolveReference: async (reference, { container }) => {
      const listingService = container.resolve("listingService");
      if (!listingService) throw new Error("ListingService is not available");
      return await listingService.getListingById(reference.id);
    },

    amenities: async (listing, __, { container }) => {
      const amenityService = container.resolve("amenityService");
      if (!amenityService) throw new Error("AmenityService is not available");
      return await amenityService.getAmenitiesByListingId(listing.id);
    },
  },
};

export default resolvers;
