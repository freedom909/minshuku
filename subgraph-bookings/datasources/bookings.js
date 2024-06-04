
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { PrismaClient } from "@prisma/client"
class BookingsDb {
  constructor() {
    this.prisma = new PrismaClient();
  }

  //   async getBookings() {
  //     return await this.prisma.booking.findMany();
  //   }
  // }
  //   // // Create an instance of bookingsAPI
  //   const bookingsDb=new BookingsDb()

  //   // // Call the getReviews method
  //   bookingsDb.getBookings().then((bookings) => console.log(bookings))

  async getBookingsForUser(guest) {
    const bookings = await this.prisma.booking.findMany({
      where: { guestId: guest.id },
    })
    return bookings;
  }
  async getHumanReadableDate(date) {
    return format(date, 'MMM d, yyyy');
  }

  async getBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    //    console.log('getBooking', booking);
    return booking;
  }

  async getCurrentGuestBooking(listingId, checkInDate, checkOutDate) {
    const booking = await this.prisma.booking.findMany({
      where: {
        listingId,
        checkInDate: {
          lt: checkOutDate,
          gt: checkInDate,
        },
      },
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

  async getReviewsForBooking(bookingId, status) {
    const filterOptions = { bookingId };
    if (status) {
      filterOptions.status = status;
    }
    const reviews = await this.prisma.review.findMany({ where: filterOptions });
    return reviews;
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

  // using the checkInDate and checkOutDate, return true if listing is available and false if not
  async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId,
        OR: [
          { checkInDate: { gte: new Date(checkInDate), lte: new Date(checkOutDate) } },
          { checkOutDate: { gte: new Date(checkInDate), lte: new Date(checkOutDate) } },
        ],
      },
    });

    return bookings.length === 0;
  }

  // returns an array of dates that are booked for the listing (upcoming and current)
  async getCurrentlyBookedDateRangesForListing(listingId) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId,
        OR: [{ status: 'UPCOMING' }, { status: 'CURRENT' }],
      },
      select: ['checkInDate', 'checkOutDate'],
    });

    const bookingsWithDates = bookings.map((b) => ({ checkInDate: b.checkInDate, checkOutDate: b.checkOutDate }));
    return bookingsWithDates;
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
          status: 'UPCOMING',
        }
      });

      return {
        id: booking.id,
        checkInDate: this.getHumanReadableDate(booking.checkInDate),
        checkOutDate: this.getHumanReadableDate(booking.checkOutDate),
      };
    } else {
      throw new Error("We couldn't complete your request ")
    }
  }
}

export default BookingsDb;