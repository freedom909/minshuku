import { PrismaClient } from "@prisma/client";
import { RESTDataSource } from '@apollo/datasource-rest';

class BookingsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:4005';
  }

  async getBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    return booking;
  }

  async getBookingsForUser(userId, status) {
    const filterOptions = { guestId: userId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({ where: filterOptions });
    return bookings;
  }

  async getBookingsForListing(listingId, status) {
    const filterOptions = { listingId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({ where: filterOptions });
    return bookings;
  }

  async getGuestIdForBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { guestId: true },
    });
    return booking.guestId;
  }

  async getListingIdForBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { listingId: true },
    });
    return booking.listingId;
  }
}

export default BookingsAPI;
