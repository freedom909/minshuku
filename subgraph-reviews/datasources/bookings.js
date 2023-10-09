import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

const prisma = new PrismaClient();

class BookingsAPI {
 // helper
 getHumanReadableDate(date) {
    return format(date, "MMM d, yyyy");
  }

  async getBooking(bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    return booking;
  }
  async getBookingsForUser(userId, status) {
    const filterOptions = { guestId: userId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await prisma.booking.findMany({
      where: { ...filterOptions },
    });
    return bookings
  }
  async getBookingsForListing(listingId, status) {
    const filterOptions = { listingId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await prisma.booking.findAll({
      where: { ...filterOptions },
    });
    return bookings
  }

  async getGuestIdForBooking(bookingId) {
    const { guestId } = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { guestId: true },
    });

    return guestId;
  }

  async getListingIdForBooking(bookingId) {
    const { listingId } = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { listingId: true },
    });

    return listingId;
  }
    // using the checkInDate and checkOutDate, return true if listing is available and false if not
    async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
        const { between, or } =  prisma;
    
        const bookings = await prisma.booking.findMany({
          where: {
            listingId: listingId,
            OR: [{ status: "UPCOMING" }, { status: "CURRENT" }]
          },
          select: { checkInDate: true, checkOutDate: true },
        });
        return bookings.map((b) => ({
          checkInDate: b.checkInDate,
          checkOutDate: b.checkOutDate,
        }));
      }
    

       // returns an array of dates that are booked for the listing (upcoming and current)
  async getCurrentlyBookedDateRangesForListing(listingId) {
    const { between, or } =  prisma;

    const bookings = await prisma.booking.findMany({
      where: {
        listingId: listingId,
        OR: [{ status: "UPCOMING" }, { status: "CURRENT" }],
      },
      select: { checkInDate: true, checkOutDate: true },
    });

    return bookings.map((b) => ({
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
    }));
  }


  async createBooking({
    listingId,
    checkInDate,
    checkOutDate,
    totalCost,
    guestId,
  }) {
    if (
      await this.isListingAvailable({ listingId, checkInDate, checkOutDate })
    ) {
      const booking = await prisma.booking.create({
        id: uuidv4(),
        listingId,
        checkInDate,
        checkOutDate,
        totalCost,
        guestId,
        status: "UPCOMING",
      });

      return {
        id: booking.id,
        checkInDate: this.getHumanReadableDate(booking.checkInDate),
        checkOutDate: this.getHumanReadableDate(booking.checkOutDate),
      };
    } else {
      throw new Error(
        "We couldn't complete your request because the listing is unavailable for the given dates."
      );
    }
  }
}
new BookingsAPI()
console.log(new BookingsAPI());

export default BookingsAPI;