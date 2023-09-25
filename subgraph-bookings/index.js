import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';

import { readFileSync } from 'fs';
import axios from 'axios';
import  get  from 'axios';
import gql from 'graphql-tag';

import errors from '../utils/errors.js';
const {AuthenticationError} = errors

const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
import resolvers from './resolvers.js';
import BookingsAPI from './datasources/bookings.js';
import ListingsAPI from './datasources/listings.js';


async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
      introspection: true,
    }),
  });

  const port = 4004; // TODO: change port number
  const subgraphName = 'bookings'; // TODO: change to subgraph name

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const userId = token.split(' ')[1]; // get the user name after 'Bearer '

        let userInfo = {};
        if (userId) {
          const { data } = await axios.get(`http://localhost:4011/login/${userId}`)
            .catch((error) => {
              throw AuthenticationError();
            });

          userInfo = { userId: data.id, userRole: data.role };
        }
        return {
          ...userInfo,

          dataSources: {
            // TODO: add data sources here
            bookingsAPI:new BookingsAPI(),
            listingsAPI:new ListingsAPI()
          },
        };
      },
      listen: {
        port,
      },
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

startApolloServer();
