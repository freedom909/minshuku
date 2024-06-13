import { v4 as uuidv4 } from "uuid";
import { PrismaClient } from "@prisma/client";
import { RESTDataSource } from "@apollo/datasource-rest";

class ReviewsAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "http://localhost:4016";
    this.prisma = new PrismaClient();
  }

  async getReviewsByUser(userId) {
    return await this.prisma.review.findMany({ where: { authorId: userId } });
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
    return await this.prisma.review.findMany({
      where: { targetType: "LISTING", targetId: listingId },
    });
  }

  async getReviewForBooking(targetType, bookingId) {
    return await this.prisma.review.findUnique({
      where: { targetType, bookingId },
    });
  }

  async createReviewForGuest({ bookingId, guestId, authorId, text, rating }) {
    return await this.prisma.review.create({
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
    return await this.prisma.review.create({
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

  async createReviewForListing({ bookingId, listingId, authorId, text, rating }) {
    return await this.prisma.review.create({
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
