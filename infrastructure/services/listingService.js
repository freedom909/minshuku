import { RESTDataSource } from '@apollo/datasource-rest';
import { GraphQLError } from 'graphql';
import { shield, allow } from 'graphql-shield';
import { permissions } from '../auth/permissions';

// Applying the permissions middleware
const permissionsMiddleware = shield({
  Query: {
    "*": allow,  // Allow all queries by default, customize as needed
  },
  Mutation: {
    "*": allow,  // Allow all mutations by default, customize as needed
  },
});

class ListingService extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:4010/';
  }

  willSendRequest(request) {
    if (this.context.user) {
      request.headers.set('Authorization', this.context.user.token);
    }
  }

  async getListingsForUser(userId) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to view listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    return this.get(`user/${userId}/listings`);
  }

  async getAllListings() {
    try {
      const response = await this.get('listings');
      return response.data;
    } catch (error) {
      console.error('Error fetching all listings:', error);
      throw new GraphQLError('Error fetching listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingById(id) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to view listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      const response = await this.get(`listings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listing by ID:', error);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListings({ numOfBeds, page, limit, sortBy }) {
    try {
      const response = await this.get(
        `listings?numOfBeds=${numOfBeds}&page=${page}&limit=${limit}&sortBy=${sortBy}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new GraphQLError('Error fetching listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getFeaturedListings(limit) {
    try {
      const response = await this.get(`featured-listings?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured listings:', error);
      throw new GraphQLError('Error fetching featured listings', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListing({ listingId }) {
    try {
      const listingData = await this.get(`listing/${listingId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (listingData) {
        return listingData;
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw new GraphQLError('Error fetching listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getAllAmenities() {
    try {
      const amenities = await this.get(`listing/amenities`);
      return amenities;
    } catch (error) {
      console.error('Error fetching amenities:', error);
      throw new GraphQLError('Error fetching amenities', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getTotalCost({ id, checkInDate, checkOutDate }) {
    try {
      const response = await this.get(
        `listings/${id}/totalCost?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching total cost:', error);
      throw new GraphQLError('Error fetching total cost', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async getListingCoordinates(id) {
    try {
      const response = await this.get(`listings/${id}/coordinates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching listing coordinates:', error);
      throw new GraphQLError('Error fetching listing coordinates', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async createListing({ title, description, price, locationId, hostId }) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to create listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      const response = await this.post('listings', {
        title,
        description,
        price,
        locationId,
        hostId,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      throw new GraphQLError('Error creating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  async updateListing({ listingId, listing }) {
    if (!this.context.user) {
      throw new GraphQLError('You must be logged in to update listings', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    try {
      if (await permissionsMiddleware.can(this.context, { action: 'updateListing' })) {
        const response = await this.patch(`listings/${listingId}`, { body: { listing } });
        return response.data;
      } else {
        throw new GraphQLError('Not authorized to update listing', { extensions: { code: 'FORBIDDEN' } });
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      throw new GraphQLError('Error updating listing', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
  }
}

export default ListingService;
