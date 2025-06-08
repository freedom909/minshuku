class AiService  {
  constructor({ userService, listingService, bookingService, paymentService } ) {
    this.userService  = userService;
    this.listingService  = listingService;
    this.bookingService  = bookingService;
    this.paymentService  = paymentService;
  }

  async getAiSummary(userId ) {
    let user = null;
    try {
      if (this.userService) {
        user = await this.userService.getUserById (userId);
      }
    } catch (error) {
      console.error('Failed to get user:', error);
    }

    let  listings = [];
    try {
      if (this.listingService ) {
        listings = await this.listingService.getListingsByUserId (userId);
      }
    } catch (error) {
      console.error('Failed to get listings:', error);
    }

    return { user, listings };
  }

  async bookListing(userId, listingId) {
    try {
      if (this.bookingService && this.paymentService) {
        const booking = await this.bookingService.createBooking(userId, listingId);
        const payment = await this.paymentService.processPayment(userId, booking.amount);
        return { booking, payment };
      } else {
        console.warn('Booking or payment service is unavailable. Skipping booking.');
        return null;
      }
    } catch (error) {
      console.error('Failed to book listing:', error);
      return null;
    }
  }
}
export default AiService;