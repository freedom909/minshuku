import { ApolloServerErrorCode } from '@apollo/server-errors';
import { GraphQLError } from 'graphql';

const resolvers = {
  Query: {
    // Resolver for fetching all listings
    listings: async (_, __, { dataSources }) => {
      return dataSources.listingsAPI.getAllListings();
    },

    // Resolver for fetching a single listing by ID
    listing: async (_, { id }, { dataSources }) => {
      return dataSources.listingsAPI.getListingById(id);
    },

    // Other query resolvers can be added here based on your schema
  },

  Mutation: {
    // Resolver for creating a new listing
    createListing: async (_, { input }, { dataSources }) => {
      const { title, description, price, locationId, hostId } = input;
      return dataSources.listingsAPI.createListing({
        title,
        description,
        price,
        locationId,
        hostId,
      });
    },

    // Other mutation resolvers can be added here based on your schema
  },

  Listing: {
    // Resolver for resolving the host associated with a listing
    host: async (listing, _, { dataSources }) => {
      return dataSources.usersAPI.getUserById(listing.hostId);
    },

    // Resolver for resolving the location associated with a listing
    location: async (listing, _, { dataSources }) => {
      return dataSources.locationsAPI.getLocationById(listing.locationId);
    },

    // Other field resolvers for the Listing type can be added here
  },

  // Other custom resolvers can be added here based on your schema

  // You can also add resolver functions for any custom scalars or enums defined in the schema
};

export default resolvers;
