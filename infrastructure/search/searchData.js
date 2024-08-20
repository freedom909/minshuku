import client from './clientSide.js';

export const searchData = async (index, criteria) => {
  try {
    const constructQuery = (criteria) => {
      const query = {
        bool: {
          must: [],
        },
      };

      if (criteria.costPerNight) {
        query.bool.must.push({
          range: {
            costPerNight: {
              gte: criteria.costPerNight.min,
              lte: criteria.costPerNight.max,
            },
          },
        });
      }

      if (criteria.price) {
        query.bool.must.push({
          range: {
            price: {
              gte: criteria.price.min,
              lte: criteria.price.max,
            },
          },
        });
      }

      if (criteria.category) {
        query.bool.must.push({
          term: {
            category: criteria.category,
          },
        });
      }

      if (criteria.name) { // amenities' name?
        query.bool.must.push({
          term: {
            brand: criteria.name,
          },
        });
      }

      if (criteria.amenities) {
        query.bool.must.push({
          term: {
            amenities: criteria.amenities,
          },
        });
      }

      if (criteria.checkInDate || criteria.checkOutDate) {
        query.bool.must.push({
          range: {
            checkInDate: {
              gte: criteria.checkInDate,
            },
            checkOutDate: {
              lte: criteria.checkOutDate,
            },
          },
        });
      }

      if (criteria.locationType) {
        query.bool.must.push({
          term: {
            locationType: criteria.locationType,
          },
        });
      }

      return query;
    };

    const response = await client.search({
      index: index,
      body: {
        query: constructQuery(criteria),
      },
    });

    // Log the full response
    console.log("Elasticsearch query response:", response);

    // Check if hits are present and log them
    const hits = response.hits?.hits || [];

    if (hits.length > 0) {
      console.log("Query hits:", hits);
    } else {
      console.info("No hits found for the query.");
    }

    return hits.map(hit => hit._source);

  } catch (error) {
    console.error('Elasticsearch query failed:', error.message);
    throw error;
  }
};
