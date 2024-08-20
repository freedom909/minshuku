import { searchData } from './searchData.js';

const testSearch = async () => {
  try {
    const query = {
      query: {
        bool: {
          must: [
            { match: { numOfBeds: 2 } }, // Ensure this field exists in your documents
            {
              range: {
                checkInDate: { lte: "2024-08-15" } // Ensure the date format matches your data
              }
            },
            {
              range: {
                checkOutDate: { gte: "2024-08-10" } // Ensure the date format matches your data
              }
            }
          ],
        }
      }
    };
    
  } catch (error) {
    console.error('Search test failed:', error);
  }
};
//searchData('listings_index', { title: 'Sample Listing' });

testSearch();
