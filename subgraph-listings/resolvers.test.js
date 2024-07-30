import { jest } from '@jest/globals'
import resolvers from './resolvers.js';

describe('hotListingsByMoney resolver', () => {
  it('should return listings when listingService.hotListingsByMoneyBookingTop5 is successful', async () => {
    const mockListings = [
      { id: '1', title: 'Listing 1', saleAmount: 100 },
      { id: '2', title: 'Listing 2', saleAmount: 200 },
    ];

    const dataSources = {
      listingService: {
        hotListingsByMoneyBookingTop5: jest.fn().mockResolvedValue(mockListings),
      },
    };

    const result = await resolvers.Query.hotListingsByMoney(null, null, { dataSources });

    expect(result).toEqual(mockListings);
    expect(dataSources.listingService.hotListingsByMoneyBookingTop5).toHaveBeenCalled();
  });

  it('should throw an error when listingService.hotListingsByMoneyBookingTop5 fails', async () => {
    const mockError = new Error('Failed to fetch listings');
    
    const dataSources = {
      listingService: {
        hotListingsByMoneyBookingTop5: jest.fn().mockRejectedValue(mockError),
      },
    };

    await expect(resolvers.Query.hotListingsByMoney(null, null, { dataSources }))
      .rejects
      .toThrow('Failed to fetch hot listings by money');
    
    expect(dataSources.listingService.hotListingsByMoneyBookingTop5).toHaveBeenCalled();
  });
});
