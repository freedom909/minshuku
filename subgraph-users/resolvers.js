import { MongoClient } from'mongodb';
import UsersAPI from './datasources/usersApi.js';
import GraphQLError from 'graphql';
const resolvers = {
  Query: {
    // Define your queries here
  },
  Mutation: {
    signUp: async (_, { input }, { dataSources }) => {
      console.log('signUp mutation called with input:', input);
      try {
        const user = await dataSources.usersAPI.register(input);
        if (!user) {
          throw new Error('User registration failed');
        }
        console.log('User registered successfully:', user);
        return user;
      } catch (error) {
        console.error('Error in signUp resolver:', error);
        throw new GraphQLError('Registration failed', {
          extensions: {
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      }
    },
  }
};

export default resolvers;
