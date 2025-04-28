import {
  AuthenticationError,
  ForbiddenError,
} from "../infrastructure/utils/errors.js";
import { requireAuth, requireRole } from "../infrastructure/auth/authAndRole.js";
import ReviewService from "../services/reviewService.js";
import ReviewRepository from "../services/repositories/reviewRepository.js";
import getUserFromDb from "../services/repositories/userRepository.js";
import connect from "../services/DB/connectNeo4jDB.js";
import handleError from "../infrastructure/utils/handleError.js";


const resolvers = {
  Query: {
    getReview: async (parent, { id }, { dataSources }) => {
      if (!dataSources) {
        throw new Error('dataSources is not available in context');
      }
      return await dataSources.reviewService.getReviewById(id);
    },
    allReviews: async (_, __, context) => {
      try {
        console.log('Context:', context);
        // 修正解构错误
        const { dataSources } = context; 
        if (!dataSources) {
          throw new Error('dataSources is not available in context');
        }
        console.log('DataSources:', dataSources);
        // 假设这里的 id 是传入的参数，原代码中未定义，需要修正
        // 这里先注释掉，你需要根据实际情况补充正确的逻辑
        // return await dataSources.reviewService.getReviewById(id);

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

    review: async (_, { id }, { dataSources, logger }) => {
      try {
        if (process.env.DEBUG_MODE === 'true') {
          logger.debug('Fetching review by ID', { reviewId: id });
        }
    
        console.log('Review resolver hit with id:', id);
    
        if (!dataSources) {
          console.error('dataSources is not available in context');// Error: dataSources is not available in context
          throw new Error('dataSources is not available in context');
        }
    
        const reviewService = dataSources.reviewService;
    
        if (!reviewService) {
          console.error('reviewService not initialized');
          throw new Error("reviewService is not initialized");
        }
    
        const review = await reviewService.getReviewById(id);
    
        console.log('Review result:', review);
    
        if (!review) {
          throw new ForbiddenError("Review not found");
        }
    
        return review;
    
      } catch (error) {
        console.error('Error in review resolver:', error);
        throw error;
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
      // 修正解构错误
      const { dataSources } = context; 
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
