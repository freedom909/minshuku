import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';

import { readFileSync } from 'fs';
import axios from 'axios';
import  get  from 'axios';
import gql from 'graphql-tag';

import  { AuthenticationError, ForbiddenError } from '../../infrastructure/utils/errors.js';


const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }));
import resolvers from './resolvers.js';

async function startApolloServer() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers,
    }),
  });

  const port = 4016; 
  const servicesName = 'payments'; 

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || '';
        const userId = token.split(' ')[1]; // get the user name after 'Bearer '

        let userInfo = {};
        if (userId) {
          const { data } = await get(`http://localhost:4011/login/${userId}`)
            .catch((error) => {
              throw AuthenticationError();
            });

          userInfo = { userId: data.id, userRole: data.role };
        }

        return {
          ...userInfo,
          dataSources: {
            paymentsAPI: new PaymentsAPI(),
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
