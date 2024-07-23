import { GraphQLError } from 'graphql';

class CartService {
  constructor({ bookingRepository }) {
    this.bookingRepository = bookingRepository;
  }

  async getBookingsForUser(user) {
    try {
      return await this.bookingRepository.find({ guestId: user.id });
    } catch (error) {
      throw new GraphQLError('Failed to fetch bookings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getBookingsByUserId(userId) {
    try {
      return await this.bookingRepository.find({ guestId: userId });
    } catch (error) {
      throw new GraphQLError('Failed to fetch bookings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getBookingById(id) {
    try {
      return await this.bookingRepository.findById(id);
    } catch (error) {
      throw new GraphQLError('Failed to fetch booking', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async confirmBooking(id) {
    try {
      const booking = await this.bookingRepository.findById(id);
      if (!booking) {
        throw new GraphQLError('Booking not found', { extensions: { code: 'BOOKING_NOT_FOUND' } });
      }
      booking.status = 'CONFIRMED';
      await booking.save();
      return booking;
    } catch (error) {
      throw new GraphQLError('Failed to confirm booking', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async cancelBooking(id) {
    try {
      const booking = await this.bookingRepository.findById(id);
      if (!booking) {
        throw new GraphQLError('Booking not found', { extensions: { code: 'BOOKING_NOT_FOUND' } });
      }
      booking.status = 'CANCELLED';
      await booking.save();
      return booking;
    } catch (error) {
      throw new GraphQLError('Failed to cancel booking', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
}

export default CartService;
