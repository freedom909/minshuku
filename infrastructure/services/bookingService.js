import { RESTDataSource } from "@apollo/datasource-rest";

class BookingService extends RESTDataSource {
  constructor({ bookingRepository, paymentRepository, listingRepository }) {
    super();
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.listingRepository = listingRepository;
    this.baseURL = 'http://localhost:4014/';
  }

async getBookingsByGuest(userId){
  try {
    const bookings = await this.bookingRepository.findAll({
      where: { guestId: userId },
    });
    return bookings;
  }catch(e){
    console.error('Error fetching bookings for guest:', e);
    throw new ForbiddenError('Unable to fetch bookings for guest', { extension: { code: 'forbidden' } });
  }
}

  async getBooking(id) {
    try {
      const booking = await this.bookingRepository.findOne({ id });
      if (!booking) {
        throw new ForbiddenError('Booking not found', { extension: { code: 'forbidden' } });
      }
      return booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new ForbiddenError('Unable to fetch booking', { extension: { code: 'forbidden' } });
    }
  }

  async getBookingsForListing(listingId, status) {
    try {
      const bookings = await this.bookingRepository.findAll({
        where: { listingId, status },
      });
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings for listing:', error);
      throw new ForbiddenError('Unable to fetch bookings for listing', { extension: { code: 'forbidden' } });
    }
  }

  async getBookingsForUser(userId, status) {
    try {
      const bookings = await this.bookingRepository.findAll({
        where: { guestId: userId, status },
      });
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings for user:', error);
      throw new ForbiddenError('Unable to fetch bookings for user', { extension: { code: 'forbidden' } });
    }
  }

  async getCurrentGuestBooking(userId) {
    try {
      const bookings = await this.bookingRepository.findAll({
        where: { guestId: userId, status: 'UPCOMING' },
      });
      const currentBooking = bookings.find(booking => new Date(booking.checkInDate) <= new Date() && new Date(booking.checkOutDate) >= new Date());
      return currentBooking || null;
    } catch (error) {
      console.error('Error fetching current guest booking:', error);
      throw new ForbiddenError('Unable to fetch current guest booking', { extension: { code: 'forbidden' } });
    }
  }

  async createBooking({ id, listingId, checkInDate, checkOutDate, totalCost, guestId, status = 'UPCOMING' }) {
    try {
      const booking = await this.bookingRepository.create({
        id,
        listingId,
        checkInDate,
        checkOutDate,
        totalCost,
        guestId,
        status,
      });
      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new ForbiddenError('Unable to create booking', { extension: { code: 'forbidden' } });
    }
  }

  async updateBookingStatus({ id, status, confirmedAt = null, cancelledAt = null }) {
    try {
      const booking = await this.bookingRepository.update({ id, status, confirmedAt, cancelledAt });
      return booking;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new ForbiddenError('Unable to update booking status', { extension: { code: 'forbidden' } });
    }
  }

  async addFunds({ userId, amount }) {
    try {
      const result = await this.paymentRepository.addFunds({ userId, amount });
      return result;
    } catch (error) {
      console.error('Error adding funds:', error);
      throw new ForbiddenError('Unable to add funds', { extension: { code: 'forbidden' } });
    }
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

  async getBookingsForUser(userId, status) {
    const bookingRepoForUser = await this.bookingRepository.getBookingsForUser(userId,status);
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
      const listing = await this.listingRepository.findOne({ where: { id: listingId } });
      return listing;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new ForbiddenError('Unable to fetch listing', { extension: { code: 'forbidden' } });
    }
  }
}

export default BookingService;
