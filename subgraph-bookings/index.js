import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault 
} from '@apollo/server/plugin/landingPage/default';
import { readFileSync } from 'fs';
import axios from 'axios';
import gql from 'graphql-tag';
import resolvers from './resolvers.js';
import BookingsAPI from './datasources/bookingsApi.js';
import ListingsAPI from './datasources/listingsApi.js';

import errors from '../infrastructure/utils/errors.js';

const { AuthenticationError } = errors;
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));

const plugins = process.env.NODE_ENV === 'production' 
  ? [ApolloServerPluginLandingPageProductionDefault({ embed: true, graphRef: 'myGraph@prod' })]
  : [ApolloServerPluginLandingPageLocalDefault({ embed: true })];

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    plugins,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const userId = token.split(' ')[1]; // get the user name after 'Bearer '

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
          bookingsAPI: new BookingsAPI(),
          listingsAPI: new ListingsAPI()
        },
      };
    },
  });

  const port = 4004; // TODO: change port number
  const subgraphName = 'bookings'; // TODO: change to subgraph name

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`);
  } catch (err) {
    console.error(err);
  }
}

startApolloServer();
