import BookingService from './BookingService';

// In accounts module
app.get('/user/:userId/bookings', requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      const bookings = await bookingService.find({ userId: userId }); // Assuming Booking is a model for bookings
      if (!bookings) {
        return res.status(404).json({ error: 'Bookings not found' });
      }
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  