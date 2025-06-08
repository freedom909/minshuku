import { DataTypes, Model } from 'sequelize';
import sequelize from './seq.js';
import { Op } from 'sequelize';

export class Booking extends Model { }

Booking.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  checkOutDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'UPCOMING', 'PAST'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  guestId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  listingId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalCost: {
    type: DataTypes.FLOAT,  // Use FLOAT for decimal values
    allowNull: false,
    defaultValue: 0,  // Ensure default value is properly set
  },
  expiresAt: { 
    type: DataTypes.DATE,
    allowNull: true,
  },

  bookingNumber: {  // Count of how many bookings the guest has made
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,  // Initialize to 1 for the first booking
  },
}, {
  sequelize,
  modelName: 'Booking',
  timestamps: true,
});

// Hook to automatically set expiresAt for PENDING bookings
Booking.beforeCreate(async (booking, options) => {
  if (booking.status === 'PENDING') {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Set expiration to 1 hour from now
    booking.expiresAt = expirationDate;
  }
});

// Hook to automatically cancel expired bookings
Booking.beforeFind(async (options) => {
  const now = new Date();
  const expiredBookings = await Booking.findAll({
    where: {
      status: 'PENDING',
      expiresAt: {
        [Op.lt]: now
      }
    }
  });

  for (const booking of expiredBookings) {
    booking.status = 'CANCELLED';
    await booking.save();
  }
});

// Hook to automatically increment bookingNumber per guest
Booking.beforeCreate(async (booking, options) => {
  const count = await Booking.count({
    where: { guestId: booking.guestId }
  });
  booking.bookingNumber = count + 1;  // Increment the booking number based on previous bookings
});

export default Booking;
