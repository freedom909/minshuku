import connect from '../DB/connectNeo4jDB.js';
import { GraphQLError } from 'graphql';

class ReviewRepository {
  async getReviewById(id) {
    console.log('[Repository] getReviewById called with:', id); //no output here
    if (!id) {
      throw new GraphQLError('Review ID is required', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    
    let session;
    let driver;
    try {
      driver = await connect();
      session = driver.session();
      console.log('Fetching review by ID:', id); //no output here
      const result = await session.run(
        `
        MATCH (r:Review {id: $id})
        RETURN r
        `,
        { id }
      );
      console.log('Query result:', result.records);
      if (result.records.length > 0) {
        return result.records[0].get('r').properties;
      }
  
      return null;
    } catch (error) {
      console.error('Error fetching review by ID:', error);
      throw new GraphQLError(`Failed to get review by ID: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }  

  async createReview(reviewData) {
    let session;
    let driver;
    try {
      driver = await connect();
      session = driver.session();
      const result = await session.run(
        `
        CREATE (r:Review {
          id: $id,
          content: $content,
          rating: $rating,
          authorId: $authorId,
          listingId: $listingId,
          hostId: $hostId,
          bookingId: $bookingId,
          targetType: $targetType,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN r
        `,
        reviewData
      );
      return result.records[0].get('r').properties;
    } catch (error) {
      console.error('Error creating review:', error);
      throw new GraphQLError(`Failed to create review: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }

  async getAverageRating({ targetType, listingId = null, hostId = null }) {
    let session;
    let driver;
    try {
      driver = await connect();
      session = driver.session();

      const filters = [];
      if (listingId) filters.push(`r.listingId = $listingId`);
      if (hostId) filters.push(`r.hostId = $hostId`);
      const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

      const query = `
        MATCH (r:Review {targetType: $targetType})
        ${whereClause}
        RETURN avg(r.rating) AS averageRating
      `;

      const result = await session.run(query, { targetType, listingId, hostId });
      return result.records[0]?.get('averageRating') || 0;
    } catch (error) {
      console.error('Error fetching average rating:', error);
      throw new GraphQLError(`Failed to get average rating: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }

  async searchReviews(criteria) {
    let driver;
    let session;
    try {
      driver = await connect();
      session = driver.session();
  
      let query = `MATCH (r:Review)`;
      const filters = [];
      const params = {};
  
      // Add filters
      if (criteria.id) {
        filters.push('r.id = $id');
        params.id = criteria.id;
      }
      if (criteria.authorId) {
        filters.push('r.authorId = $authorId');
        params.authorId = criteria.authorId;
      }
      if (criteria.listingId) {
        filters.push('r.listingId = $listingId');
        params.listingId = criteria.listingId;
      }
      if (criteria.hostId) {
        filters.push('r.hostId = $hostId');
        params.hostId = criteria.hostId;
      }
      if (criteria.targetType) {
        filters.push('r.targetType = $targetType');
        params.targetType = criteria.targetType;
      }
      if (criteria.rating !== undefined) {
        filters.push('r.rating = $rating');
        params.rating = criteria.rating;
      }
      if (criteria.round !== undefined) {
        filters.push('r.round = $round');
        params.round = criteria.round;
      }
      if (criteria.isPinned !== undefined) {
        filters.push('r.isPinned = $isPinned');
        params.isPinned = criteria.isPinned;
      }
      if (criteria.isRecommended !== undefined) {
        filters.push('r.isRecommended = $isRecommended');
        params.isRecommended = criteria.isRecommended;
      }
  
      // Basic full-text search on `content`
      if (criteria.content) {
        filters.push(`toLower(r.content) CONTAINS toLower($content)`);
        params.content = criteria.content;
      }
  
      if (filters.length > 0) {
        query += ` WHERE ${filters.join(' AND ')}`;
      }
  
      // Sorting
      const sortFieldMap = {
        RATING: 'r.rating',
        CREATED_AT: 'r.createdAt',
        UPDATED_AT: 'r.updatedAt'
      };
  
      if (criteria.sortBy) {
        const field = sortFieldMap[criteria.sortBy];
        const direction = criteria.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        if (field) {
          query += ` ORDER BY ${field} ${direction}`;
        }
      }
  
      // Pagination
      if (criteria.offset) {
        query += ` SKIP $offset`;
        params.offset = criteria.offset;
      }
  
      if (criteria.limit) {
        query += ` LIMIT $limit`;
        params.limit = criteria.limit;
      }
  
      query += ` RETURN r`;
  
      const result = await session.run(query, params);
  
      return result.records.map(record => record.get('r').properties);
    } catch (error) {
      throw new GraphQLError(`Failed to search reviews: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }
  
  

  async getReviews({ targetType, listingId = null, hostId = null }) {
    return this.searchReviews({ targetType, listingId, hostId });
  }

  async getReviewsForListing(listingId) {
    let driver;
    let session;
    try {
      driver = await connect();
      session = driver.session();
      
      const query = `
        MATCH (r:Review {listingId: $listingId})
        RETURN r
        ORDER BY r.createdAt DESC
      `;
      
      const result = await session.run(query, { listingId });
      return result.records.map(record => record.get('r').properties);
    } catch (error) {
      throw new GraphQLError(`Failed to get reviews for listing: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' }
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }

  async getAllReviews() {
    let session;
    let driver;
    try {
      driver = await connect();
      session = driver.session();
      const result = await session.run(
        `
        MATCH (r:Review)
        RETURN r.id as id, r.createdAt as createdAt
        ORDER BY r.createdAt DESC
        `
      );
      return result.records.map(record => ({
        id: record.get('id'),
        createdAt: record.get('createdAt')
      }));
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw new GraphQLError(`Failed to get all reviews: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }

  async getReview({ targetType, bookingId }) {
    let session;
    let driver;
    try {
      driver = await connect();
      session = driver.session();
      const result = await session.run(
        `
        MATCH (r:Review {targetType: $targetType, bookingId: $bookingId})
        RETURN r
        `,
        { targetType, bookingId }
      );
      if (result.records.length > 0) {
        return result.records[0].get('r').properties;
      }
      return null;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw new GraphQLError(`Failed to get review: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close();
      if (driver) driver.close();
    }
  }
}

export default ReviewRepository;
