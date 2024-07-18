import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import axios from 'axios';
import gql from 'graphql-tag';

import  { AuthenticationError, ForbiddenError } from '../../infrastructure/utils/errors.js';

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
import resolvers from './resolvers.js';
import BookingsAPI from './datasources/bookingsApi.js';
import ListingsAPI from './datasources/listingsApi.js';
import ReviewsAPI from './datasources/reviewsApi.js';
import AccountsAPI from './datasources/accountsApi.js';

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
  });

  const port = 4015;
  const servicesName = 'reviews';

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const userId = token.split(' ')[1];
        let userInfo = {};

        if (userId) {
          try {
            const { data } = await axios.get(`http://localhost:4011/login/${userId}`);
            userInfo = { userId: data.id, userRole: data.role };
          } catch (error) {
            throw new AuthenticationError();
          }
        }

        return {
          ...userInfo,
          dataSources: {
            reviewsAPI: new ReviewsAPI(),
            bookingsAPI: new BookingsAPI(),
            listingsAPI: new ListingsAPI(),
            accountsAPI: new AccountsAPI()
          },
        };
      },
      listen: {
        port,
      },
    });

    console.log(`🚀 Subgraph ${servicesName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

startApolloServer();
