import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";
import Sequelize, { DataTypes } from "sequelize";
import Booking from "../../services/bookings/models/booking";
require('dotenv').config();

class BookingsAPI{
    constructor(){
        const db=this.initializeSequelizeDb()
        this.db=db
}
initializeSequelizeDb() {
    const config = {
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
     
      dialect: "mysql",
   // logging : false //turn off the logs for development purposes only!
      logging: false, // set this to true if you want to see logging output in the terminal console
    };
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    const db = {};
    db.Booking = Booking(sequelize, DataTypes);
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
  }
 // helper
 getHumanReadableDate(date) {
    return format(date, "MMM d, yyyy");
  }

  async getBooking(bookingId) {
    const booking = await this.db.Booking.findByPk(bookingId);
    return booking;
  }

  async getBookingsForUser(userId, status) {
    const filterOptions = { guestId: userId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.db.Booking.findAll({
      where: { ...filterOptions },
    });
    return bookings.map((b) => b.dataValues);
  }
  async getBookingsForListing(listingId, status) {
    const filterOptions = { listingId };
    if (status) {
      filterOptions.status = status;
    }
    const bookings = await this.db.Booking.findAll({
      where: { ...filterOptions },
    });
    return bookings.map((b) => b.dataValues);
  }

  async getGuestIdForBooking(bookingId) {
    const { guestId } = await this.db.Booking.findOne({
      where: { id: bookingId },
      attributes: ["guestId"],
    });

    return guestId;
  }

  async getListingIdForBooking(bookingId) {
    const { listingId } = await this.db.Booking.findOne({
      where: { id: bookingId },
      attributes: ["listingId"],
    });

    return listingId;
  }
    // using the checkInDate and checkOutDate, return true if listing is available and false if not
    async isListingAvailable({ listingId, checkInDate, checkOutDate }) {
        const { between, or } = this.db.Sequelize.Op;
    
        const bookings = await this.db.Booking.findAll({
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
    const { between, or } = this.db.Sequelize.Op;

    const bookings = await this.db.Booking.findAll({
      where: {
        listingId: listingId,
        [or]: [{ status: "UPCOMING" }, { status: "CURRENT" }],
      },
      attributes: ["checkInDate", "checkOutDate"],
    });

    const bookingsWithDates = bookings.map((b) => ({
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
    }));
    return bookingsWithDates;
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