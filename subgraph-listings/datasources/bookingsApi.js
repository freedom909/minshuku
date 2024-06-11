import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PrismaClient } from '@prisma/client';

class BookingsAPI {
  constructor() {
    this.prisma = new PrismaClient();
  }

  getHumanReadableDate(date) {
    return format(date, 'MMM d, yyyy');
  }

  async getBooking(bookingId) {
    return await this.prisma.booking.findUnique({
      where: { id: bookingId }
    });
  }

  async getBookingsForUser(userId, status) {
    const filterOptions = { guestId: userId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({
      where: filterOptions,
    });
    return bookings;
  }

  async getBookingsForListing(listingId, status) {
    const filterOptions = { listingId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({
      where: filterOptions,
    });
    return bookings;
  }

  async getGuestIdForBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { guestId: true }
    });
    return booking ? booking.guestId : null;
  }

  async getListingIdForBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { listingId: true }
    });
    return booking ? booking.listingId : null;
  }

  async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId,
        OR: [
          {
            checkInDate: {
              gte: checkInDate,
              lte: checkOutDate
            }
          },
          {
            checkOutDate: {
              gte: checkInDate,
              lte: checkOutDate
            }
          }
        ]
      }
    });
    return bookings.length === 0;
  }

  async getCurrentlyBookedDateRangesForListing(listingId) {
    return await this.prisma.booking.findMany({
      where: {
        listingId,
        OR: [
          { status: 'UPCOMING' },
          { status: 'CURRENT' }
        ]
      },
      select: {
        checkInDate: true,
        checkOutDate: true
      }
    });
  }

  async createBooking({ listingId, checkInDate, checkOutDate, totalCost, guestId }) {
    if (await this.isListingAvailable({ listingId, checkInDate, checkOutDate })) {
      const booking = await this.prisma.booking.create({
        data: {
          id: uuidv4(),
          listingId,
          checkInDate,
          checkOutDate,
          totalCost,
          guestId,
          status: 'UPCOMING'
        }
      });

      return {
        id: booking.id,
        checkInDate: this.getHumanReadableDate(booking.checkInDate),
        checkOutDate: this.getHumanReadableDate(booking.checkOutDate)
      };
    } else {
      throw new Error('We couldn\'t complete your request because the listing is unavailable for the given dates.');
    }
  }
}

export default BookingsAPI;
