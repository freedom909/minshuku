import client  from './clientSide.js';

export const searchData = async (index, query) => {
  try {
    const { body } = await client.search({
      index,
      body: query,
      _source: true // Ensure the source data is included in the response
    });
    
    console.log('Elasticsearch response:', JSON.stringify(body, null, 2));
    
    if (body && body.hits && body.hits.hits.length > 0) {
      return body.hits.hits.map(hit => hit._source);
    } else {
      throw new Error('No results found or invalid response format');
    }
    
  } catch (error) {
    console.error('Elasticsearch query failed:', error);
    throw error;
  }
};

