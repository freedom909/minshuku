function createMockListingService() {
  return {
    getListingsByUserId: async (userId) => {
      console.warn('ListingService not available. Returning empty list.');
      return [];
    },
  };
}