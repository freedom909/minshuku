import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { applyMiddleware } from 'graphql-middleware'
import { readFileSync } from 'fs'
import axios from 'axios'
import gql from 'graphql-tag'
import paseto from 'paseto';
const { V2 } = paseto;

import express from 'express'
import cors from 'cors'
// import authRouter from './auth.route.js'
import { getToken, handleInvalidToken } from './helpers/tokens.js'
import errors from '../utils/errors.js'
const { AuthenticationError } = errors
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }))
import resolvers from './resolvers.js'
import AccountsAPI from './datasources/accounts.js'

const httpClient = axios.create({
  baseURL: 'http://localhost:4011'
})
const app = express()
app.use(express.json())
// app.use('/api',authRouter)
// Use paseto as a middleware  
app.use(async (req, res, next) => {
  const token = req.headers['authorization']
  if (token) {
  try {
    const payload=await V2.verify(token,process.env.PASETO_SECRET)
    req.user = payload //attach the payload to the request object
  } catch (error) {
    console.error('Invalid token:',err.message)
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

async function startApolloServer () {
  const server = new ApolloServer({
    schema: buildSubgraphSchema({
      typeDefs,
      resolvers
    })
  })

  const port = 4002
  const subgraphName = 'accounts'

  try {
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || ''

        const userId = token.split(' ')[1] // get the user name after 'Bearer '

        let userInfo = {}
        if (userId) {
          const { data } = await axios
            .get(`http://localhost:4011/login/${userId}`)
            .catch(error => {
              throw AuthenticationError('you can not login with userId')
            })

          userInfo = { userId: data.id, userRole: data.role }
        }
        const { cache } = server

        return {
          ...userInfo,
          dataSources: {
            accountsAPI: new AccountsAPI({ cache })
          }
        }
      },
      listen: {
        port
      }
    })

    console.log(`🚀 Subgraph ${subgraphName} running at ${url}`)
  } catch (err) {
    console.error(err)
  }
}

startApolloServer()
