import { Router } from 'express';
const router = Router();

router.get('/hot-listings-by-money', async (req, res) => {
    try {
        const listings = await db.collection('listings').aggregate([
          {
          $lookup: {
          from: 'bookings',
          localField: 'id',
          foreignField: 'listingId',
          as: 'bookings',
        },
    },
    {
      $project: {
        description: 1,
        coordinates: 1,
        saleAmount: { $sum: '$bookings.totalCost' },
      },
    },
    { $sort: { saleAmount: -1 } },
    { $limit: 5 },
  ]).toArray();
  res.json(listings);
  } catch (error) {
    console.error('Error fetching hot listings by money:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/hot-listings-by-booking-number', async (req, res) => {
    try {
      const listings = await db.collection('listings').aggregate([
        {
          $lookup: {
            from: 'bookings',
            localField: 'id',
            foreignField: 'listingId',
            as: 'bookings',
          },
        },
        {
          $project: {
            description: 1,
            coordinates: 1,
            bookingNumber: { $size: '$bookings' },
          },
        },
        { $sort: { bookingNumber: -1 } },
        { $limit: 5 },
      ]).toArray();
  
      res.json(listings);
    } catch (error) {
      console.error('Error fetching hot listings by booking number:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  export default router