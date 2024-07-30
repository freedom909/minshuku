import Review from '../models/review.js'; // Assuming you have a Review model defined

class ReviewRepository {
  async createReview(reviewData) {
    return await Review.create(reviewData);
  }

  async getAverageRating({ targetType, listingId = null, hostId = null }) {
    const where = { targetType };
    if (listingId) where.listingId = listingId;
    if (hostId) where.hostId = hostId;
    const reviews = await Review.findAll({ where });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return reviews.length ? totalRating / reviews.length : 0;
  }

  async getReviews({ targetType, listingId = null, hostId = null }) {
    const where = { targetType };
    if (listingId) where.listingId = listingId;
    if (hostId) where.hostId = hostId;
    return await Review.findAll({ where });
  }

  async getReview({ targetType, bookingId }) {
    return await Review.findOne({ where: { targetType, bookingId } });
  }

  async getUser(userId) {
    return await Review.findOne({ where: { userId } });
  }
}

export default ReviewRepository;
