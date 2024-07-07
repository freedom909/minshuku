import errors from './utils/errors.js';
const { AuthenticationError, ForbiddenError } = errors

const resolvers = {
  // TODO: fill in resolvers
  Query: {
    bookingsForListing: async (_, { listingId, status }, { dataSources, userId, userRole }) => {
      if (!userId) throw AuthenticationError();
      if (userRole === 'Host') {
        // need to check if listing belongs to host
        const listings = await dataSources.listingsAPI.getListingsForUser(userId)
        if (listings.find((Listing) => Listing.id === listingId)) {
          const bookings = (await dataSources.bookingsAPI.getBookingsForListing(listingId, status)) || []
          return bookings
        }
        else {
          throw new Error('listing doesnot belong to host')
        }

      } else {
        throw ForbiddenError('Only hosts have access to listing bookings')
      }
    },

    bookings: async (_, { guestId }, { dataSources }) => {
      const { bookingService } = dataSources;
      return await bookingService.getBookingsForUser(guestId);
    },

    currentGuestBooking: async (_, { listing }, { dataSources, userId, userRole }) => {
      const {listingId,checkInDate,checkOutDate}=listing
      if (!userId) throw AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getCurrentGuestBooking(listingId,checkInDate,checkOutDate)
        return bookings
      }
      else {
        throw ForbiddenError('Only guests have access to guest bookings')
      }
    },

    guestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId)
        return bookings
      } else {
        throw ForbiddenError("only guests have access to trip")
      }
    },
    pastGuestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError();
      if (userRole === 'Guest') {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, "COMPLETED")
        return bookings
      } else {
        throw ForbiddenError("Only guests have access to trips")
      }
    },

    upcomingGuestBookings: async (_, __, { dataSources, userId, userRole }) => {
      if (!userId) throw new AuthenticationError()
      if (userRole === "Guest") {
        const bookings = await dataSources.bookingsAPI.getBookingsForUser(userId, "UPCOMING")
        return bookings
      } else {
        throw ForbiddenError("only guests have access to trip")
      }
    },
    Mutation: {
      // booking mutation
      createBooking: async (_, { createBookingInput }, { dataSources, userId }) => {
        if (!userId) throw new AuthenticationError();
        const { listingId, checkInDate, checkOutDate } = createBookingInput;
        const { totalCost } = await dataSources.listingsAPI.getTotalCost({
          id: listingId,
          checkInDate,
          checkOutDate
        })
        try {
          await dataSources.paymentsAPI.subtractFunds({ userId, amount: totalCost })
        } catch (error) {
          return {
            code: 400,
            success: false,
            message: "We couldn’t complete your request because your funds are insufficient.",
          }
        }
        try {
          const booking = await dataSources.bookingsAPI.createBooking({
            id: uuidv4(),
            listingId,
            checkInDate,
            checkOutDate,
            totalCost,
            guestId: userId,
            status: "UPCOMING"
          })
          return {
            code: 200,
            success: true,
            message: 'Your Booking has been created',
            booking
          };
        } catch (error) {
          return {
            code: 400,
            success: false,
            message: "We couldn’t complete your request because your funds are insufficient.",
          }
        }
      },
    },

    Booking: {
      listing: ({ listingId }) => {
        return { id: listingId }
      },
      checkInDate: ({ checkInDate }, _, { dataSources }) => {
        return dataSources.bookingsAPI.getHumanReadableDate(checkInDate)
      },
      checkOutDate: ({ checkOutDate }, _, { dataSources }) => {
        return dataSources.bookingsAPI.getHumanReadableDate(checkOutDate);
      },
      guest: ({ guestId }) => {
        return { id: guestId }
      },
      __resolveReference:(booking,{dataSources}) => {
        return dataSources.bookingsAPI.getBooking(booking.id)
      },

      totalPrice: async ({ listingId, checkInDate, checkOutDate }, _, { dataSources }) => {
        const { totalCost } = await dataSources.listingsAPI.getTotalCost({
          id: listingId,
          checkInDate,
          checkOutDate
        })
        return totalCost
      }
    },

    Guest: {
      __resolveReference: (user, { dataSources }) => {
        return dataSources.accountsAPI.getUser(user.id);
      },
      funds: async (_, __, { dataSources, userId }) => {
        const wallet = await dataSources.accountsAPI.getUserWallet(userId)
        return {
          funds: wallet.funds
        }
      },
      addFundsToWallet: async (_, { amount }, { dataSources, userId }) => {
        if (!userId) throw new AuthenticationError()
        try {
          const updateWallet = await dataSources.paymentsAPI.addFunds({ userId, amount })
          return {
            success: true,
            message: "Funds added successfully",
            data: updateWallet.amount
          }
        } catch (error) {
          return {
            code: 400,
            success: false,
            message: "We couldn’t complete your request because your funds are insufficient.",
          }
        }
      },
      Listing: {

        bookings: async ({ id }, _, { dataSources }) => {
          return await dataSources.bookingsAPI.getBookingsForListing(id)
        },
        __resolveReference:(listing,{dataSources}) => {
          return dataSources.listingsAPI.getListing(listing.id)
        }
      }
    }
  }
}
export default resolvers;
