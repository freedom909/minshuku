import connect from '../DB/connectNeo4jDB.js';
import { GraphQLError } from 'graphql';

class ReviewRepository {
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
      driver = await connect(); // Connect to Neo4j
      session = driver.session();

      // Start building the Cypher query
      let query = `
        MATCH (r:Review)
      `;

      // Dynamically add WHERE clauses based on the criteria
      const filters = [];
      const params = {};

      if (criteria.reviewId) {
        filters.push('r.id = $reviewId');
        params.reviewId = criteria.reviewId;
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

      if (criteria.rating !== undefined) {
        filters.push('r.rating = $rating');
        params.rating = criteria.rating;
      }

      // Add filters to the query if there are any
      if (filters.length > 0) {
        query += ` WHERE ${filters.join(' AND ')}`;
      }

      // Finish the query
      query += `
        RETURN r
      `;

      // Run the query and process the results
      const result = await session.run(query, params);

      // Map the result to extract properties
      return result.records.map(record => record.get('r').properties);
    } catch (error) {
      throw new GraphQLError(`Failed to search reviews: ${error.message}`, {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    } finally {
      if (session) session.close(); // Close the session
      if (driver) driver.close(); // Close the driver connection
    }
  }

  async getReviews({ targetType, listingId = null, hostId = null }) {
    return this.searchReviews({ targetType, listingId, hostId });
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
