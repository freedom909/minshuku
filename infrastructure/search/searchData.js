import client from './clientSide.js';

// Function to construct a fuzzy search query
const constructFuzzyQuery = (field, value) => {
  return {
    fuzzy: {
      [field]: {
        value: value,
        fuzziness: 'AUTO'
      }
    }
  };
}

export const searchListings= async (index, criteria) => {
  // Add autocomplete
  if (criteria.autocomplete) {
    const autocompleteQuery = {
      multi_match: {
        query: criteria.autocomplete,
        fields: ['name^3', 'description'],
        fuzziness: 'AUTO'
      }
    };
    if (!criteria.query) {
      criteria.query = { bool: { must: [] } };
    }
    criteria.query.bool.must.push(autocompleteQuery);
  }

  // Add fuzzy search if not already handled
  if (criteria.fuzzy && !criteria.query?.bool?.must?.some(clause => clause.fuzzy)) {
    const fuzzyFields = ['name', 'description'];
    const fuzzyQueries = fuzzyFields.map(field => constructFuzzyQuery(field, criteria.fuzzy));
    criteria.query.bool.must.push(...fuzzyQueries);
  }

  // Add filtering
  if (criteria.filters) {
    for (const [field, value] of Object.entries(criteria.filters)) {
      const filterQuery = {
        term: {
          [field]: value
        }
      };
      criteria.query.bool.must.push(filterQuery);
    }
  }
  try {
    const constructQuery = (criteria) => {
  const sort = [];
  if (criteria.sortBy) {
    sort.push({
      [criteria.sortBy]: {
        order: criteria.sortOrder || 'asc'
      }
    });
  }
      const query = {
        bool: {
          must: [],
        },
      };

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
      query.bool.must.push(constructFuzzyQuery('brand', criteria.name));
    } else if (criteria.fuzzySearch) {
      Object.entries(criteria.fuzzySearch).forEach(([field, value]) => {
        query.bool.must.push(constructFuzzyQuery(field, value));
      });
    }
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
      sort: sort.length > 0 ? sort : undefined,
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
