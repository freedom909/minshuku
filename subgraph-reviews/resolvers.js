import { AuthenticationError, ForbiddenError } from "../infrastructure/utils/errors.js";
import { requireAuth, requireRole } from "../infrastructure/auth/authAndRole.js";

const resolvers = {
  Mutation: {
    submitGuestReview: requireAuth(async (
      _,
      { guestReview: guestReviewInput, bookingId },
      { dataSources, userId }
    ) => {
      const { reviewService, bookingService } = dataSources;
      const booking = await bookingService.getBooking(bookingId);

      if (!booking) {
        throw new ForbiddenError("Booking not found", { extensions: { code: 'NOT_FOUND' } });
      }

      if (booking.status !== 'complete') {
        throw new ForbiddenError("You can't review this booking now", { extensions: { code: 'UNSUPPORTED' } });
      }

      const guestId = booking.guestId;
      const createGuestReview = await reviewService.postReview({
        ...guestReviewInput,
        guestId,
        authorId: userId,
        bookingId,
      });

      return {
        code: 200,
        success: true,
        message: "Review submitted",
        guestReview: createGuestReview,
      };
    }),
    submitHostAndLocationReviews: requireRole('HOST', async (
      _,
      { hostReview: hostReviewInput, bookingId, locationReview: locationReviewInput },
      { dataSources, userId }
    ) => {
      const { listingService, bookingService, reviewService } = dataSources;
      const booking = await bookingService.getBooking(bookingId);

      if (!booking) {
        throw new ForbiddenError("Booking not found", { extensions: { code: 'NOT_FOUND' } });
      }

      const listingId = await listingService.getListingIdForBooking(bookingId);
      const locationReview = await reviewService.createReviewForListing({
        ...locationReviewInput,
        listingId,
        authorId: userId,
        bookingId,
      });

      const { hostId } = await listingService.getListing(listingId);
      const createdHostReview = await reviewService.createReviewForHost({
        ...hostReviewInput,
        authorId: userId,
        hostId,
        bookingId,
      });

      return {
        code: 200,
        success: true,
        message: "Location review successfully created",
        locationReview,
        hostReview: createdHostReview,
      };
    }),
  },

  Listing: {
    overallRating: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getOverallRatingForListing(id);
    },
    reviews: ({ id }, _, { dataSources }) => {
      const { reviewService } = dataSources;
      return reviewService.getReviewsForListing(id);
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
    __resolveReference: (user, { dataSources }) => {
      const { userService } = dataSources;
      return userService.getUser(user.id);
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
  },

  User: {

    __resolveType(user) {
      return user.role;
    },
  },
  searchReviews: async (_, { criteria }) => {
    try {
      const results = await searchReviews(criteria);
      return results;
    } catch (error) {
      throw new Error(`Failed to search reviews: ${error.message}`);
    }
  }  
};

export default resolvers;
