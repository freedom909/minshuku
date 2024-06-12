import errors from "../utils/errors.js";
const { AuthenticationError, ForbiddenError } = errors;
import { requireAuth, requireRole } from "../infrastructure/auth/authAndRole.js";

const resolvers = {
  Mutation: {
    submitGuestReview: requireAuth(async (
      _,
      { guestReview: guestReviewInput, bookingId },
      { dataSources, userId }
    ) => {
      const guestId = await dataSources.bookingsAPI.getGuestIdForBooking(bookingId);
      const createGuestReview = await dataSources.reviewsAPI.postReview({
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
      const listingId = await dataSources.listingsAPI.getListingIdForBooking(bookingId);
      const locationReview = await dataSources.reviewsAPI.createReviewForListing({
        ...locationReviewInput,
        listingId,
        authorId: userId,
        bookingId,
      });

      const { hostId } = await dataSources.listingsAPI.getListing(listingId);
      const createdHostReview = await dataSources.reviewsAPI.createReviewForHost({
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
      return dataSources.reviewsAPI.getOverallRatingForListing(id);
    },
    reviews: ({ id }, _, { dataSources }) => {
      return dataSources.reviewsAPI.getReviewsForListing(id);
    },
  },

  Booking: {
    guestReview: ({ id }, _, { dataSources }) => {
      return dataSources.reviewsAPI.getReviewForBooking("GUEST", id);
    },
    hostReview: ({ id }, _, { dataSources }) => {
      return dataSources.reviewsAPI.getReviewForBooking("HOST", id);
    },
    locationReview: ({ id }, _, { dataSources }) => {
      return dataSources.reviewsAPI.getReviewForBooking("LISTING", id);
    },
  },

  Host: {
    overallRating: ({ id }, _, { dataSources }) => {
      return dataSources.reviewsAPI.getOverallRatingForHost(id);
    },
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
  },

  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
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
};

export default resolvers;
