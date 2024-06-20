import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../models/seq.js';
import User from '../models/user.js';
import Account from '../models/account.js';
import Listing from '../models/listing.js';
import Review from '../models/review.js';
import ReviewOfGuest from '../models/reviewOfGuest.js';
import ReviewOfHost from '../models/reviewOfHost.js';
import Booking from '../models/booking.js';
import Payment from '../models/payment.js';
import Amenity from '../models/Amenity.js';
import ListingAmenities from '../models/listingAmenities.js';

const models = { User, Account, Listing, Review, ReviewOfGuest, ReviewOfHost, Booking, Payment, Amenity, ListingAmenities };

async function loadJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function seedModel(model, data) {
  for (const item of data) {
    await model.create(item);
  }
}

async function seedDatabase() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    const users = await loadJSON(path.join(__dirname, 'users.json'));
    const accounts = await loadJSON(path.join(__dirname, 'accounts.json'));
    const listings = await loadJSON(path.join(__dirname, 'listings.json'));
    const reviews = await loadJSON(path.join(__dirname, 'reviews.json'));
    const reviewsOfGuest = await loadJSON(path.join(__dirname, 'reviewsOfGuest.json'));
    const reviewsOfHost = await loadJSON(path.join(__dirname, 'reviewsOfHost.json'));
    const bookings = await loadJSON(path.join(__dirname, 'bookings.json'));
    const payments = await loadJSON(path.join(__dirname, 'payments.json'));
    const amenities = await loadJSON(path.join(__dirname, 'amenities.json'));
    const listingAmenities = await loadJSON(path.join(__dirname, 'listingAmenities.json'));

    await seedModel(User, users);
    await seedModel(Account, accounts);
    await seedModel(Listing, listings);
    await seedModel(Review, reviews);
    await seedModel(ReviewOfGuest, reviewsOfGuest);
    await seedModel(ReviewOfHost, reviewsOfHost);
    await seedModel(Booking, bookings);
    await seedModel(Payment, payments);
    await seedModel(Amenity, amenities);
    await seedModel(ListingAmenities, listingAmenities);

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
