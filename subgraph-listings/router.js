import { Router } from 'express';
const router = Router();
import { container } from '../infrastructure/DB/container.js';

router.post('/listings', async (req, res) => {
  try {
    const { title, description, price, hostId } = req.body;
    // Mock host role if hostId is not provided
    const mockHostId = hostId || 'mock-host-id';
    const listing = await container.resolve('listingService').createListing({
      title,
      description,
      price,
      hostId: mockHostId
    });
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).send('Internal Server Error');
  }
});

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
  
  router.get('/hotListingsByMoneyBookingTop5', async (req, res) => {
    try {
      const listingService = container.resolve('listingService');
      const listings = await listingService.hotListingsByMoneyBookingTop5();
      res.json(listings);
    } catch (error) {
      console.error('Error fetching hot listings by money:', error);
      res.status(500).send('Internal Server Error');
    }
  });


  export default router