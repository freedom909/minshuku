// services/seeders/reviewSeeder.js
import mongoose from 'mongoose';
import Review from '../../models/review.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/air';
console.log('Connecting to:', MONGO_URI);
async function seedReviews() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // 2. Clear existing mock reviews
    await Review.deleteMany({});
    console.log('🧹 Cleared old review data');

    // 3. Create mock review data
    const mockReviews = [
      {
        listingId: 'listing-002', // 🔹 manually set
        title: 'Great stay with friendly host',
        rating: 4.8,
        content: 'The house was clean and cozy. The host was very welcoming!',
        picture: 'https://example.com/review1.jpg',
        locationId: new mongoose.Types.ObjectId(),
        hostId: new mongoose.Types.ObjectId(),
        guestId: new mongoose.Types.ObjectId(),
        authorId: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        comments: [],
        likes: [],
        dislikes: [],
        isFeatured: true,
        isHighlighted: false,
        isPinned: false,
        round: 1,
      },
      {
        listingId: 'listing-002',
        title: 'Perfect weekend getaway',
        rating: 5.0,
        content: 'Absolutely amazing location with stunning views. Would come again!',
        picture: 'https://example.com/review2.jpg',
        locationId: new mongoose.Types.ObjectId(),
        hostId: new mongoose.Types.ObjectId(),
        guestId: new mongoose.Types.ObjectId(),
        authorId: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        comments: [],
        likes: [],
        dislikes: [],
        isFeatured: false,
        isHighlighted: true,
        isPinned: false,
        round: 2,
      },
      {
        listingId: 'listing-002',
        title: 'Could be better',
        rating: 3.5,
        content: 'The place was nice but a bit noisy at night.',
        picture: 'https://example.com/review3.jpg',
        locationId: new mongoose.Types.ObjectId(),
        hostId: new mongoose.Types.ObjectId(),
        guestId: new mongoose.Types.ObjectId(),
        authorId: new mongoose.Types.ObjectId(),
        bookingId: new mongoose.Types.ObjectId(),
        comments: [],
        likes: [],
        dislikes: [],
        isFeatured: false,
        isHighlighted: false,
        isPinned: false,
        round: 1,
      },
    ];

    // 4. Insert mock data
    await Review.insertMany(mockReviews);
    console.log(`✅ Inserted ${mockReviews.length} mock reviews for listingId='listing-002'`);

    // 5. Close connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error seeding reviews:', error);
    process.exit(1);
  }
}

// Run script directly

  seedReviews()
  .then(() => console.log('🌱 Seeding done!'))
  .catch(err => console.error('❌ Seeding error:', err));

