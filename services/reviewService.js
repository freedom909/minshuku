import ReviewRepository from "./repositories/reviewRepository.js";
import getUserFromDb from "./repositories/userRepository.js";

class ReviewService {
  constructor({ reviewRepository }) {
    this.reviewRepository = reviewRepository;
  }

  async getReviewById(id) {
    if (!id) {
      throw new Error("Review ID is required");
    }
    console.log('Review service hit with id:', id); //no output here
    return this.reviewRepository.getReviewById(id);
  }

  async createReviewForListing({ listingId, authorId, bookingId, status, ...reviewInput }) {
    if (!listingId || !authorId || !bookingId || status !== "complete") {
      throw new Error("Invalid input parameters or incomplete booking");
    }

    return this.reviewRepository.createReview({
      ...reviewInput,
      listingId,
      authorId,
      bookingId,
      targetType: 'LISTING',
    });
  }

  async createReviewForHost({ hostId, authorId, bookingId, ...reviewInput }) {
    if (!hostId || !authorId || !bookingId) {
      throw new Error("Invalid input parameters");
    }

    return this.reviewRepository.createReview({
      ...reviewInput,
      hostId,
      authorId,
      bookingId,
      targetType: 'HOST',
    });
  }

  async getOverallRatingForListing(listingId) {
    return this.reviewRepository.getAverageRating({ targetType: 'LISTING', listingId });
  }

  async getReviewsForListing(listingId) {
    return this.reviewRepository.getReviews({ targetType: 'LISTING', listingId });
  }

  async getReviewForBooking(targetType, bookingId) {
    return this.reviewRepository.getReview({ targetType, bookingId });
  }

  async getOverallRatingForHost(hostId) {
    return this.reviewRepository.getAverageRating({ targetType: 'HOST', hostId });
  }
}

export default ReviewService;
