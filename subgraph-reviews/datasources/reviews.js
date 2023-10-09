import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()


class ReviewsAPI {
  constructor() {
    this.prisma = prisma;
  }

  async getReviewsByUser(userId) {
    return this.prisma.review.findMany({ where: { authorId: userId } });
  }

  async getOverallRatingForListing(listingId) {
    const overallRating = await this.prisma.review.aggregate({
      where: { targetType: "LISTING", targetId: listingId },
      _avg: { rating: true },
    });

    return overallRating._avg.rating;
  }

  async getOverallRatingForHost(hostId) {
    const overallRating = await this.prisma.review.aggregate({
      where: { targetType: "HOST", targetId: hostId },
      _avg: { rating: true },
    });

    return overallRating._avg.rating;
  }

  async getReviewsForListing(listingId) {
    return this.prisma.review.findMany({
      where: { targetType: "LISTING", targetId: listingId },
    });
  }

  async getReviewForBooking(targetType, bookingId) {
    return this.prisma.review.findUnique({
      where: { targetType, bookingId },
    });
  }

  async createReviewForGuest({ bookingId, guestId, authorId, text, rating }) {
    return this.prisma.review.create({
      data: {
        id: uuidv4(),
        bookingId,
        targetId: guestId,
        targetType: "GUEST",
        authorId,
        rating,
        text,
      },
    });
  }

  async createReviewForHost({ bookingId, hostId, authorId, text, rating }) {
    return this.prisma.review.create({
      data: {
        id: uuidv4(),
        bookingId,
        targetId: hostId,
        targetType: "HOST",
        authorId,
        text,
        rating,
      },
    });
  }

  async createReviewForListing({
    bookingId,
    listingId,
    authorId,
    text,
    rating,
  }) {
    return this.prisma.review.create({
      data: {
        id: uuidv4(),
        bookingId,
        targetId: listingId,
        targetType: "LISTING",
        authorId,
        text,
        rating,
      },
    });
  }
}

export default ReviewsAPI;
