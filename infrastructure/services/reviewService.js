import ReviewRepository from "../repositories/reviewRepository.js";
class ReviewService {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async postReview({ guestId, authorId, bookingId, ...reviewInput }) {
    return await this.reviewRepository.createReview({
      ...reviewInput,
      guestId,
      authorId,
      bookingId,
      targetType: 'GUEST',
    });
  }

  async createReviewForListing({ listingId, authorId, bookingId, ...reviewInput }) {
    return await this.reviewRepository.createReview({
      ...reviewInput,
      listingId,
      authorId,
      bookingId,
      targetType: 'LISTING',
    });
  }

  async createReviewForHost({ hostId, authorId, bookingId, ...reviewInput }) {
    return await this.reviewRepository.createReview({
      ...reviewInput,
      hostId,
      authorId,
      bookingId,
      targetType: 'HOST',
    });
  }

  async getOverallRatingForListing(listingId) {
    return await this.reviewRepository.getAverageRating({ targetType: 'LISTING', listingId });
  }

  async getReviewsForListing(listingId) {
    return await this.reviewRepository.getReviews({ targetType: 'LISTING', listingId });
  }

  async getReviewForBooking(targetType, bookingId) {
    return await this.reviewRepository.getReview({ targetType, bookingId });
  }

  async getOverallRatingForHost(hostId) {
    return await this.reviewRepository.getAverageRating({ targetType: 'HOST', hostId });
  }

  async getUser(userId) {
    return await this.reviewRepository.getUser(userId);
  }
}

export default ReviewService;
