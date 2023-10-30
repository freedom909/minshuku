
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import { PrismaClient } from '@prisma/client'
class BookingsAPI {
  constructor() {
    this.prisma=new PrismaClient()
  }
  
  // helper
  getHumanReadableDate(date) {
    return format(date, "MMM d, yyyy");
  }

  async getBooking(bookingId) {
    const booking = await this.prisma.booking.findUnique({
      where:{
        id: bookingId
      }
    });
    return booking;
  }

  async getBookingsForUser(userId, status) {
    const filterOptions = { guestId: userId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({
      where: { ...filterOptions },
    });
    return bookings.map((b) => b.dataValues);
  }

  async getBookingsForListing(listingId, status) {
    const filterOptions = { listingId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.prisma.booking.findMany({
      where: { ...filterOptions },
    });
    return bookings.map((b) => b.dataValues);
  }

  async getGuestIdForBooking(bookingId) {
    const { guestId } = await this.prisma.booking.findOne({
      where: { id: bookingId },
      attributes: ["guestId"],
    });

    return guestId;
  }

  async getListingIdForBooking(bookingId) {
    const { listingId } = await this.prisma.booking.findOne({
      where: { id: bookingId },
      attributes: ["listingId"],
    });

    return listingId;
  }

  // using the checkInDate and checkOutDate, return true if listing is available and false if not
  async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
  

    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId: listingId,
        [or]: [
          { checkInDate: { [between]: [checkInDate, checkOutDate] } },
          { checkOutDate: { [between]: [checkInDate, checkOutDate] } },
        ],
      },
    });

    return bookings.length === 0;
  }

  // returns an array of dates that are booked for the listing (upcoming and current)
  async getCurrentlyBookedDateRangesForListing(listingId) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        listingId: listingId,
        OR: [{ status: "UPCOMING" }, { status: "CURRENT" }],
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    });
  
    return bookings;
  }
//     const upcomingAndCurrentBookings = [];
//   let startDate = new Date();
//   while (startDate < endDate) {
  //     const dateRange = {};
  // 	    dateRange[Op.and]=[{status:"UPCOMING"},{checkInDate:<startDate},{checkOutDate>:endDate
  //}];
  //   const result=await BookingModel().countDocuments(dateRange);
  // console.log("result",result,"startDate",startDate,'endDate',endDate);
  // 	if (!result){
  // 		upcomingAndCurrentBookings.push(startDate);
  // 	}
  // 	startDate.setDate(startDate.getDate() + 1);
  // }
  // return upcomingAndCurrentBookings;
  
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
      const booking = await this.db.Booking.create({
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

export default BookingsAPI;
