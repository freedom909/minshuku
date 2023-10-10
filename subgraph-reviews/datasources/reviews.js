// TODO: rename file and add datasource code hereconst { v4: uuidv4 } = require('uuid');
import { v4 as uuidv4 } from "uuid";
//import  { PrismaClient }  from 'file:///C:/Users/takayama/Desktop/apollo/air3/subgraph-reviews/node_modules/.prisma/client/index.js';
import { PrismaClient } from "@prisma/client"

class ReviewsAPI {
  constructor() {
    this.prisma = new PrismaClient();
  }
  // async getReviews() {
  //   return await this.prisma.review.findMany();
  // }


// // Create an instance of ReviewsAPI
// const reviewsAPI = new ReviewsAPI();

// // Call the getReviews method
// reviewsAPI.getReviews().then(reviews => console.log(reviews));

  async getReviewsByUser(userId) {
    return this.prisma.Review.findAll({ where: { authorId: userId } });
  }


  async getOverallRatingForListing(listingId) {
    const overallRating = await this.prisma.Review.aggregate({
      where: { targetType: "LISTING", targetId: listingId },
     _avg:{rating:true}
    });

    return overallRating._avg.rating
  }

  async getOverallRatingForHost(hostId) {
    const overallRating = await this.prisma.Review.aggregate({
      where: { targetType: "HOST", targetId: hostId },
      _avg:{rating:true}
    });

    return overallRating._avg.rating;
  }

  async getReviewsForListing(listingId) {
    const reviews = await this.prisma.Review.findMany({
      where: { targetType: "LISTING", targetId: listingId },
    });
    return reviews;
  }

  async getReviewForBooking(targetType, bookingId) {
    // booking review submitted by guest about a host or a listing
    const review = await this.prisma.Review.findUnique({
      where: { targetType, bookingId },
    });
    return review;
  }

  async createReviewForGuest({ bookingId, guestId, authorId, text, rating }) {
    const review = await this.prisma.Review.create({
      id: uuidv4(),
      bookingId,
      targetId: guestId,
      targetType: "GUEST",
      authorId,
      rating,
      text,
    });

    return review;
  }

  async createReviewForHost({ bookingId, hostId, authorId, text, rating }) {
    const review = await this.db.Review.create({
      id: uuidv4(),
      bookingId,
      targetId: hostId,
      targetType: "HOST",
      authorId,
      text,
      rating,
    });

    return review;
  }

  async createReviewForListing({
    bookingId,
    listingId,
    authorId,
    text,
    rating,
  }) {
    const review = await this.prisma.Review.create({
      id: uuidv4(),
      bookingId,
      targetId: listingId,
      targetType: "LISTING",
      authorId,
      text,
      rating,
    });

    return review;
  }
}

export  default ReviewsAPI
