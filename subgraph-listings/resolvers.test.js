// import { jest } from '@jest/globals'
import resolvers from './resolvers.js';


// describe('hotListingsByMoney resolver', () => {
//   it('should return listings when listingService.hotListingsByMoneyBookingTop5 is successful', async () => {
//     const mockListings = [
//       { id: '1', title: 'Listing 1', saleAmount: 100 },
//       { id: '2', title: 'Listing 2', saleAmount: 200 },
//     ];

//     const dataSources = {
//       listingService: {
//         hotListingsByMoneyBookingTop5: jest.fn().mockResolvedValue(mockListings),
//       },
//     };

//     const result = await resolvers.Query.hotListingsByMoney(null, null, { dataSources });

//     expect(result).toEqual(mockListings);
//     expect(dataSources.listingService.hotListingsByMoneyBookingTop5).toHaveBeenCalled();
//   });

//   it('should throw an error when listingService.hotListingsByMoneyBookingTop5 fails', async () => {
//     const mockError = new Error('Failed to fetch listings');

//     const dataSources = {
//       listingService: {
//         hotListingsByMoneyBookingTop5: jest.fn().mockRejectedValue(mockError),
//       },
//     };

//     await expect(resolvers.Query.hotListingsByMoney(null, null, { dataSources }))
//       .rejects
//       .toThrow('Failed to fetch hot listings by money');

//     expect(dataSources.listingService.hotListingsByMoneyBookingTop5).toHaveBeenCalled();
//   });
// });

// Mock data source (simulating your listingService)
// const mockListingService = {
//   findOne: async ({ where }) => {
//     // Simulate fetching the listing from the database
//     if (where.id === "listing-1") {
//       return {
//         costPerNight: 120,
//       };
//     }
//     return null;
//   },
// };

// // Mock resolver context
// const context = {
//   dataSources: {
//     listingService: mockListingService,
//   },
// };

// // Mock parent data (usually provided by previous resolver in the chain)
// const parent = {
//   id: "listing-1",
// };

// // The resolver function (copied from your existing code)
// const totalCostResolver = async (parent, { checkInDate, checkOutDate }, context) => {
//   const { id } = parent;

//   try {
//     const listing = await context.dataSources.listingService.findOne({
//       where: { id },
//       attributes: ["costPerNight"],
//     });

//     console.log(`Fetched listing for ID: ${id}`, listing);

//     if (!listing || typeof listing.costPerNight !== 'number') {
//       console.error("Could not find listing or invalid costPerNight");
//       return null;
//     }

//     const checkIn = new Date(checkInDate);
//     const checkOut = new Date(checkOutDate);

//     console.log('Parsed Check-in date:', checkIn);
//     console.log('Parsed Check-out date:', checkOut);

//     if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
//       console.error("Invalid check-in or check-out date format.");
//       return null;
//     }

//     const diffInDays = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

//     console.log('Difference in days:', diffInDays);

//     if (diffInDays <= 0) {
//       console.error("Check-out date must be after check-in date.");
//       return null;
//     }

//     const totalCost = listing.costPerNight * diffInDays;

//     console.log('Calculated total cost:', totalCost);

//     return totalCost;
//   } catch (error) {
//     console.error("Error in totalCost resolver:", error.message);
//     return null;
//   }
// };

// // Test the resolver
// (async () => {
//   const args = {
//     checkInDate: "2021-02-03",
//     checkOutDate: "2021-02-13",
//   };

//   const result = await totalCostResolver(parent, args, context);
//   console.log('Total cost result:', result);
// })();
// (async () => {
//   const input = { id: 'listing-10', listingStatus: 'COMPLETED' };
//   const result = await resolvers.Mutation.updateListingStatus(null, { input }, { dataSources: { /* mock data source */ } });
//   console.log('Mutation result:', result);
// })();

const mockListingService = {
  async updateListingStatus(id, listingStatus) {
    // Mock behavior: Return a simulated result as if the database update succeeded
    if (id === 'listing-10') {
      return { listingStatus }; // Simulate a successful update with the given status
    }
    return null; // Simulate a case where the listing wasn't found or update failed
  },
};

(async () => {
  const input = { id: 'listing-8', listingStatus: 'CANCELLED' };
  const result = await resolvers.Mutation.updateListingStatus(
    null,
    { input },
    { dataSources: { listingService: mockListingService } } // Use the mock data source here
  );
  console.log('Mutation result:', result);
})();

