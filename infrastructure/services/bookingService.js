import { RESTDataSource } from "@apollo/datasource-rest";

class BookingService extends RESTDataSource {
  constructor(bookingRepository) {
    super();
    this.bookingRepository = bookingRepository;
    this.baseURL = 'http://localhost:4012/';
  }

  async getBooking(id) {
    const bookingRepoById = await this.bookingRepository.getBooking(id);
    return bookingRepoById;
  }

  async getBookingsForListing(id) {
    const bookingRepoForListing = await this.bookingRepository.getBookingsForListing(id);
    return bookingRepoForListing;
  }

  async getCurrentlyBookedDateRangesForListing(id) {
    const currentlyBookingRepoForListing = await this.bookingRepository.getCurrentlyBookedDateRangesForListing(id);
    return currentlyBookingRepoForListing;
  }

  async isListingAvailable(listing) {
    const bookingRepo = await this.bookingRepository.isListingAvailable(listing);
    const bookings = await bookingRepo.get(`listing/${listing.id}/currentBookedDates`);
    return bookings.length === 0;
  }

  async getBookingsForUser(userId) {
    const bookingRepoForUser = await this.bookingRepository.getBookingsForUser(userId);
    return bookingRepoForUser;
  }

  async getBookingsForUserWithStatus(userId, status) {
    const bookingRepoForUser = await this.bookingRepository.getBookingsForUser(userId, status);
    return bookingRepoForUser;
  }

  async getCurrentGuestBooking(userId) {
    const bookingRepoForGuest = await this.bookingRepository.getCurrentGuestBooking(userId);
    return bookingRepoForGuest;
  }

  async createBooking({ id, listingId, checkInDate, checkOutDate, totalCost, guestId, status = 'UPCOMING' }) {
    try {
      const booking = { id, listingId, checkInDate, checkOutDate, totalCost, guestId, status };
      const bookingRepo = await this.bookingRepository.createBooking(booking);
      return bookingRepo;
    } catch (error) {
      throw new ForbiddenError('Unable to create booking', { extension: { code: 'forbidden' } });
    }
  }

  async updateBookingStatus({ id, status, confirmedAt }) {
    try {
      const bookingRepo = await this.bookingRepository.updateBookingStatus(id, status, confirmedAt);
      return bookingRepo;
    } catch (error) {
      throw new ForbiddenError('Unable to update booking status', { extension: { code: 'forbidden' } });
    }
  }

  async addFunds({ userId, amount }) {
    try {
      const bookingRepo = await this.paymentRepository.addFunds(userId, amount);
      return bookingRepo;
    } catch (error) {
      throw new ForbiddenError('Unable to add funds', { extension: { code: 'forbidden' } });
    }
  }

  async getListing(listingId) {
    try {
      const listingRepo = await this.listingRepository.getListing(listingId);
      return listingRepo;
    } catch (error) {
      throw new ForbiddenError('Unable to get listing', { extension: { code: 'forbidden' } });
    }
  }
}

export default BookingService;
