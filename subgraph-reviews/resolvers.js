import {
  AuthenticationError,
  ForbiddenError,
} from "../infrastructure/utils/errors.js";
import { requireAuth, requireRole } from "../infrastructure/auth/authAndRole.js";
import ReviewRepository from "../services/repositories/reviewRepository.js";
import getUserFromDb from "../services/repositories/userRepository.js";
import connect from "../services/DB/connectNeo4jDB.js";
import handleError from "../infrastructure/utils/handleError.js";

const resolvers = {
  Query: {
    allReviews: async (_, __, context) => {
      try {
        console.log('Context:', context);
        const { dataSources } = context;
        console.log('DataSources:', dataSources);
        if (!dataSources?.reviewRepository) {
          throw new Error('reviewRepository is not available in dataSources');
        }
        return await dataSources.reviewRepository.getAllReviews();
      } catch (error) {
        console.error('Error in allReviews:', error);
        return [];
      }
    },

    searchReviews: async (_, { criteria }, context) => {
      try {
        const { dataSources } = context;
        const reviews = await dataSources.reviewRepository.searchReviews(criteria);
        return reviews;
      } catch (error) {
        console.error('Error in searchReviews:', error);
        return [];
      }
    },

    review: async (_, { id }, context) => {
      const { dataSources, logger } = context;
      try {
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Fetching review by ID', { reviewId: id });
        }
        console.log('Review resolver hit with id:', id); // ← This will now log
        if (!dataSources.reviewRepository) {
          throw new Error("reviewRepository is not initialized");
        }
        const review = await dataSources.reviewRepository.getReviewById(id);// can this path be accessed?
        console.log('Review found:', review); // no output here
        if (!review) {
          throw new ForbiddenError("Review not found");
        }
    
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Review found', {
            reviewId: review.id,
            status: review.status
          });
        }
    
        return review;
      } catch (error) {
        return handleError(error, context, 'review');
      }
    },
    

    reviewsForListing: async (_, { listingId }, context) => {
      try {
        const { dataSources } = context;
        const reviews = await dataSources.reviewRepository.getReviewsForListing(listingId);
        return reviews;
      } catch (error) {
        console.error('Error in reviewsForListing:', error);
        return [];
      }
    },
  },

  Mutation: {
    submitGuestReview: requireAuth(async (_, { guestReview, bookingId }, { userId, dataSources }) => {
      const booking = await dataSources.bookingService.getBooking(bookingId);
      if (!booking || booking.status !== "complete") {
        throw new ForbiddenError("Invalid booking status for review submission");
      }
      return dataSources.reviewRepository.createGuestReview(guestReview, bookingId, userId, booking.guestId);
    }),

    submitHostAndLocationReviews: requireRole("HOST", async (_, args, context) => {
      const { dataSources } = context.dataSources;
      return dataSources.reviewRepository.createHostAndLocationReviews(args, context);
    }),
  },

  Listing: {
    overallRating: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getOverallRatingForListing(id);
    },
    review: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewsForListing(id);
    },
    __resolveReference: async (id, { dataSources }) => {
      return dataSources.listingService.getListing(id);
    },
  },

  Booking: {
    guestReview: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewForBooking("GUEST", id);
    },
    hostReview: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewForBooking("HOST", id);
    },
    locationReview: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewForBooking("LISTING", id);
    },
  },

  Host: {
    overallRating: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getOverallRatingForHost(id);
    },
    __resolveReference: (user, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getUser(user.id);
    },
  },

  Guest: {
    __resolveReference: ({ id }, { dataSources }) => {
      const { userService } = dataSources;
      return userService.getUserFromDb(id);
    },
  },

  Review: {
    author: (review) => {
      let role = "";
      if (review.targetType === "LISTING" || review.targetType === "HOST") {
        role = "Guest";
      } else {
        role = "Host";
      }
      return { __typename: role, id: review.authorId };
    },
    isFeatured: ({ id }, _, { dataSources }) => {
      const { listingService } = dataSources;
      return listingService.isFeatured(id);
    },
    likesCount: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getLikeCount(id);
    },
    dislikesCount: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getDislikeCount(id);
    },
    booking: async ({ bookingId }, _, { dataSources }) => {
      return dataSources.bookingService.getBooking(bookingId);
    },
    createdAt: ({ createdAt }) => new Date(createdAt).toISOString(),
    __resolveReference: async ({ id }, { dataSources }) => {
      return dataSources.reviewService.getReview(id);
    },
  },

  User: {
    __resolveType: ({ role }) => role,
  }
};

export default resolvers;
