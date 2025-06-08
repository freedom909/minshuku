function createMockBookingService() {
  return {
    createBooking: async (listingId, userId) => {
      console.warn('BookingService not available. Returning null.');
      return null;
    },
  };
}