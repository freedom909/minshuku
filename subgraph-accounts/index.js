import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { readFileSync } from 'fs'
import axios from 'axios'
import gql from 'graphql-tag'
import paseto from 'paseto';
const { V2 } = paseto;
import express from 'express'
import cors from 'cors'
import { applyMiddleware } from 'graphql-middleware'
import { authenticate, authorize, isAuthenticated, isAdmin, isOwner, isHost } from '../infrastructure/auth.js'
import { permissions } from '../infrastructure/permissions.js'
// import { AuthenticationError, ForbiddenError } from '../middleware/errors.js' // Ensure the path is correct

// Import typeDefs and resolvers
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }))
import resolvers from './resolvers.js'

// Import AccountsAPI data source
import AccountsAPI from './datasources/accounts.js'

const app = express()
app.use(express.json())

// Middleware to handle Paseto token
app.use(async (req, res, next) => {
  const token = req.headers['authorization']
  if (token) {
    try {
      const payload = await V2.verify(token, process.env.PASETO_SECRET)
      req.user = payload // Attach the payload to the request object
    } catch (error) {
      console.error('Invalid token:', error.message)
    }
  }
  next();
})

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4011']
    })
  )
}

// Build the executable schema and apply middleware
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})
const schemaWithMiddleware = applyMiddleware(schema, permissions);

async function startApolloServer() {
  const server = new ApolloServer({
    schema: schemaWithMiddleware,
    dataSources: () => ({
      accountsAPI: new AccountsAPI()
    }),
    context: ({ req }) => ({
      user: req.user // Attach the user from the middleware to the context
    })
  })

  const port = 4011
  const subgraphName = 'accounts'

  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port }
    })

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`)
  } catch (error) {
    console.error(error)
  }
}

startApolloServer()
