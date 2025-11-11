import { GraphQLError } from 'graphql';
import { ForbiddenError } from '../infrastructure/utils/errors.js';

class BookingService {
  constructor({ bookingRepository, paymentRepository, listingRepository }) {
    this.bookingRepository = bookingRepository;
    this.paymentRepository = paymentRepository;
    this.listingRepository = listingRepository;
  }

  async getBookingsByGuest(userId) {
    try {
      return await this.bookingRepository.getBookingsForGuest(userId);
    } catch (error) {
      console.error('Error fetching bookings for guest:', error);
      throw new ForbiddenError('Unable to fetch bookings for guest', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getBooking(id) {
    try {
      const booking = await this.bookingRepository.getBooking(id);
      if (!booking) {
        throw new ForbiddenError('Booking not found', { extensions: { code: 'NOT_FOUND' } });
      }
      return booking;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new ForbiddenError('Unable to fetch booking', { extensions: { code: 'INTERNAL_ERROR' } });
    }
  }

  async getBookingsForListing(listingId, status) {
    try {
      return await this.bookingRepository.getBookingsForHost(listingId, status);
    } catch (error) {
      console.error('Error fetching bookings for listing:', error);
      throw new ForbiddenError('Unable to fetch bookings for listing', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getCurrentGuestBooking(userId) {
    try {
      return await this.bookingRepository.getCurrentGuestBooking(userId);
    } catch (error) {
      console.error('Error fetching current guest booking:', error);
      throw new ForbiddenError('Unable to fetch current guest booking', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getBookingsForUser(userId, status) {
    try {
      return await this.bookingRepository.getBookingsForGuest(userId, status);
    } catch (error) {
      console.error('Error fetching bookings for user:', error);
      throw new ForbiddenError('Unable to fetch bookings for user', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async createBooking({ id, listingId, checkInDate, checkOutDate, totalCost, guestId, status = 'UPCOMING' }) {
    try {
      const booking = await this.bookingRepository.createBooking({
        guestId,
        listingId,
        checkInDate,
        checkOutDate,
        totalCost,
        status,
      });
      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new ForbiddenError('Unable to create booking', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async updateBookingStatus({ id, status, confirmedAt = null, cancelledAt = null }) {
    try {
      const updateFields = { status };
      if (confirmedAt) updateFields.confirmedAt = confirmedAt;
      if (cancelledAt) updateFields.cancelledAt = cancelledAt;
      
      const result = await this.bookingRepository.updateBooking(id, updateFields);
      return result;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw new ForbiddenError('Unable to update booking status', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
    try {
      return await this.bookingRepository.isListingAvailable(listingId);
    } catch (error) {
      console.error('Error checking listing availability:', error);
      throw new ForbiddenError('Unable to check listing availability', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getCurrentlyBookedDateRangesForListing(id) {
    try {
      return await this.bookingRepository.getBookingsForHost(id);
    } catch (error) {
      console.error('Error fetching booked date ranges:', error);
      throw new ForbiddenError('Unable to fetch booked date ranges', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getAllBookings() {
    try {
      return await this.bookingRepository.findAll({});
    } catch (error) {
      console.error('Error fetching all bookings:', error);
      throw new ForbiddenError('Unable to fetch all bookings', { extensions: { code: 'FORBIDDEN' } });
    }
  }

  async getBookingById(id) {
    try {
      return await this.getBooking(id);
    } catch (error) {
      console.error('Error fetching booking by ID:', error);
      throw new ForbiddenError('Unable to fetch booking by ID', { extensions: { code: 'FORBIDDEN' } });
    }
  }
}

export default BookingService;