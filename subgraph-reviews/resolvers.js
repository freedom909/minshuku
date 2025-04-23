import {
  AuthenticationError,
  ForbiddenError,
} from "../infrastructure/utils/errors.js";
import { requireAuth, requireRole } from "../infrastructure/auth/authAndRole.js";
import ReviewRepository from "../services/repositories/reviewRepository.js";
import getUserFromDb from "../services/repositories/userRepository.js";
import connect from "../services/DB/connectNeo4jDB.js";

// Enhanced error handler
const handleError = (error, context, operation) => {
  const { logger } = context;
  const errorDetails = {
    operation,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (process.env.DEBUG_MODE === 'true') {
    logger.error('GraphQL operation failed', errorDetails);
  }

  // Return enhanced error information in debug mode
  if (process.env.DEBUG_MODE === 'true') {
    return {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      stack: error.stack,
      timestamp: errorDetails.timestamp
    };
  }

  // Return sanitized error in production
  return {
    message: 'An error occurred',
    code: 'INTERNAL_ERROR'
  };
};

const resolvers = {
  Query: {
    searchReviews: async (_, { criteria }, context) => {
      const { dataSources, logger } = context;
      try {
        if (!dataSources?.reviewRepository) {
          throw new Error('Review repository not available');
        }
        
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Searching reviews', { criteria });
        }

        const reviews = await dataSources.reviewRepository.searchReviews(criteria);
        
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Reviews fetched successfully', {
            count: reviews.length,
            firstReview: reviews[0] ? reviews[0].id : null
          });
        }

        return reviews;
      } catch (error) {
        return handleError(error, context, 'searchReviews');
      }
    },

    reviews: async (_, { id }, context) => {
      const { dataSources, logger } = context;
      try {
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Fetching review by ID', { reviewId: id });
        }

        const review = await dataSources.reviewRepository.getReviewById(id);
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
        return handleError(error, context, 'reviews');
      }
    },

    getReviewForListing: async (_, { listingId }, context) => {
      const { dataSources, logger } = context;
      try {
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Fetching reviews for listing', { listingId });
        }

        const reviews = await dataSources.reviewRepository.getReviewsByListingId(listingId);

        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Listing reviews fetched', {
            listingId,
            reviewCount: reviews.length
          });
        }

        return reviews;
      } catch (error) {
        return handleError(error, context, 'getReviewForListing');
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
      const { dataSources } = context.dataSources
      return dataSources.reviewRepository.createHostAndLocationReviews(args, context);
    }),

    Listing: {
      overallRating: ({ id }, _, { dataSources }) => {
        const { reviewService } = dataSources;
        return reviewService.getOverallRatingForListing(id);
      },
      reviews: ({ id }, _, { dataSources }) => {
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

      // Resolve reference for federated queries
      __resolveReference: async ({ id }, { dataSources }) => {
        return dataSources.reviewService.getReview(id);
      },
    },

    User: {
      __resolveType: ({ role }) => role,
    },
  }
};

export default resolvers;
