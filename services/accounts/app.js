import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { validRegister, validLogin } from '../../infrastructure/helpers/valid.js';
import { hashPassword, checkPassword } from '../../infrastructure/helpers/passwords.js';
import { getToken } from '../../infrastructure/helpers/tokens.js';
import { permissions } from '../../infrastructure/auth/permission.js';
import { authenticateJWT, checkPermissions } from '../../infrastructure/auth/auth.js';
import connectDB from './config/database.js';
import User from './models/user.js';
import Account from './models/account.js';
import Listing from './models/listing.js';
import Location from './models/location.js';

dotenv.config();
connectDB();

const router = express.Router();
router.use(express.json());

const { bookingsWithPermission, listingsWithPermission } = permissions;

router.get('/', (req, res) => {
  res.send('Hello World!');
});
// Example route to register a new user
router.post('/register', async (req, res) => {
  try {
    if (!getToken(req, res)) {
      const { email, password, name } = req.body;

      if (validRegister(email, password)) {
        // Hash the password
        const hashedPassword = await hashPassword(password);
        // Create a new user
        const newUser = new User({
          email,
          password: hashedPassword,
          name,
        });
        await newUser.save();

        // Return the new user
        res.status(201).json(newUser);
      } else {
        res.status(400).json({ error: 'Invalid registration details' });
      }
    } else {
      res.status(403).json({ error: 'Token already exists' });
    }
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Example route to login a user
router.post('/login', validLogin, async (req, res) => {
  try {
    // Check if the request already contains a token
    const existingToken = getToken(req);
    if (existingToken) {
      // Redirect to a specific route (e.g., dashboard)
      return res.redirect('/dashboard'); // Change the destination as needed
    }

    const { email, password } = req.body;

    // Validate login credentials
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || !(await checkPassword(password, user.password))) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Generate a new token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get all listings for a specific user
router.get('/users/:userId/listings', authenticateJWT, checkPermissions, async (req, res) => {
  try {
    const { userId } = req.params;
    const listings = await Listing.find({ hostId: userId });
    return res.json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get total cost of listings for a user
router.get('/users/:userId/totalCost', async (req, res) => {
  try {
    const { userId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    const diffInDays = getDifferenceInDays(checkInDate, checkOutDate);

    if (isNaN(diffInDays)) {
      return res.status(400).send('Invalid date format. Please provide valid check-in and check-out dates.');
    }

    const userListings = await Listing.find({ hostId: userId });

    if (!userListings || userListings.length === 0) {
      return res.status(400).send('No listings found for the specified user.');
    }

    const totalCost = userListings.reduce((sum, listing) => {
      return sum + (listing.costPerNight * diffInDays);
    }, 0);

    res.json({ totalCost });
  } catch (error) {
    console.error('Error fetching total cost for user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get all bookings for a specific user
router.get('/users/:userId/bookings', authenticateJWT, checkPermissions, async (req, res) => {
  try {
    const { userId } = req.params;

    if (bookingsWithPermission) {
      const bookings = await Booking.find({ userId });
      return res.json({ bookings });
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/login/:userId', async (req, res) => {
  const user = await User.findOne(req.params.userId);
  if (!user) {
    return res.status(404).send('Could not log in');
  }
  return res.json(user);
});

// Example route to get user profile
router.get('/profile', authenticateJWT, async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ error: 'You must be logged in to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { userId } = decoded;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
