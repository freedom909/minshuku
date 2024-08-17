import client  from './clientSide.js';

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
      body: {
        query: esQuery
      }
    });
    console.log("Elasticsearch query response:", response);
    console.log('Elasticsearch response:', JSON.stringify(body, null, 2));
    
    const hits = response.body.hits.hits || [];
    return hits.map(hit => hit._source);
  } catch (error) {
    console.error('Elasticsearch query failed:', error.message);
    throw error;
  }
}
  


