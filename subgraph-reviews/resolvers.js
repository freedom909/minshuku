
const { AuthenticationError, ForbiddenError } = require("../utils/errors");

const resolvers = {

  Mutation:{
    submitGuestReview: async (
      _,
      { GuestReviewInput, bookingsId },
      { dataSources, userId }
    ) => {
      if (!userId) throw AuthenticationError();
  
      const guestId = await dataSources.bookingsAPI.getGuestIdForBooking(
        bookingsId
      );
      const createGuestReview = await dataSources.reviewsAPI.postReview({
        ...GuestReviewInput,
        guestId,
        authorId: userId,
        bookingsId,
      });
      return {
        code: 200,
        success: true,
        message: "review submitted",
        guestReview: createGuestReview,
      };
    },
    submitHostAndlocationReviews: async (
      _,
      { hostReviewInput, bookingId, locationReviewInput },
      { dataSources, userId }
    ) => {
      if (!userId) throw AuthenticationError();
      const listingId = await dataSources.listingsAPI.getListingIdForBooking(
        bookingId
      );
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
        message: "location Review are successful to create",
        locationReview: locationReview,
        createdHostReview: createdHostReview,
      };
    },
  
    Listing: {
      overallRating: ({ id }, _, { dataSources }) => {
        return dataSources.reviewsAPI.getOverallRatingForListing(id);
      },
      reviews: ({ id }, _, { dataSources }) => {
        return dataSources.reviewsAPI.getReviewForListing(id);
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
        return dataSources.reviewsAPI.getGuestIdForBooking("LISTING", id);
      },
    },
    Host: {
      overallRating: ({ id }, _, { dataSources }) => {
        return dataSources.reviewsAPI.getOverallRatingForHost(id);
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
  },
  User: {
    __resolveType(user) {
      return user.role;
    },
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
  },
  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.accountsAPI.getUser(user.id);
    },
  },
}


module.exports = resolvers;
