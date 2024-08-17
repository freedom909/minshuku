import client from './clientSide.js';

<<<<<<< HEAD
export const searchData = async (index, criteria) => {
  const { reservedDate, numOfBeds, someListingIds } = criteria;
  try {
    const esQuery = {
      bool: {
        must: [
          ...(reservedDate ? [
            { range: { checkInDate: { gte: reservedDate.checkInDate } } },
            { range: { checkOutDate: { lte: reservedDate.checkOutDate } } }
          ] : []),
          ...(numOfBeds ? [{ match: { numOfBeds } }] : []),
          ...(someListingIds && someListingIds.length > 0 ? [{ terms: { id: someListingIds } }] : [])
        ]
      }
    };
    const response = await client.search({
      index: index,
=======
export const searchData = async (index, query) => {
  const { reservedDate, numOfBeds, someListingIds } = query;

  // Construct the query using the provided criteria
  const simpleQuery = {
    query: {
      match_all: {}
    }
  };
  

  try {
    const response = await client.search({
      index: 'listings_index',
>>>>>>> 83a2145888019a4f75d39fb3c1bedee36d050d44
      body: {
        query: esQuery
      }
    });
<<<<<<< HEAD
    console.log("Elasticsearch query response:", response);
    console.log('Elasticsearch response:', JSON.stringify(body, null, 2));
    
    const hits = response.body.hits.hits || [];
    return hits.map(hit => hit._source);
=======

    console.log("Elasticsearch query response:", JSON.stringify(response, null, 2));

    if (response && response.hits && Array.isArray(response.hits.hits)) {
      const hits = response.hits.hits;

      if (hits.length > 0) {
        hits.forEach((hit, index) => {
          console.log(`Hit ${index + 1}:`, JSON.stringify(hit._source, null, 2));
        });
      } else {
        console.error("No hits found.");
      }
    } else {
      console.error("Invalid Elasticsearch response structure:", JSON.stringify(response, null, 2));
    }
>>>>>>> 83a2145888019a4f75d39fb3c1bedee36d050d44
  } catch (error) {
    console.error('Elasticsearch query failed:', error.message);
    throw error;
  }
}
<<<<<<< HEAD
  


=======
>>>>>>> 83a2145888019a4f75d39fb3c1bedee36d050d44
