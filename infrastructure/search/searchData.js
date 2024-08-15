import client from './clientSide.js';

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
      body: {
        query: esQuery
      }
    });

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
  } catch (error) {
    console.error('Elasticsearch query failed:', error.message);
    throw error;
  }
}
