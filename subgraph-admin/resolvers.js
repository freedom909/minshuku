// ... existing code ...

const { Op } = require('sequelize');

const AdminQuery = {
  // ... existing code ...
  totalListingIncome: async (_, __, { dataSources }) => {
    const { bookingService } = dataSources;
    const bookings = await bookingService.getAllBookings();
    const totalIncome = bookings.reduce((sum, booking) => sum + booking.totalCost, 0);
    return totalIncome;
  }
};

// ... existing code ...