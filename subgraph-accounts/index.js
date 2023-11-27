import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { buildSubgraphSchema } from '@apollo/subgraph'
import { applyMiddleware } from 'graphql-middleware'
import { readFileSync } from 'fs'
import axios from 'axios'
import gql from 'graphql-tag'
import paseto from 'paseto'

import express from 'express'
import cors from 'cors'

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
// Use express-jwt as a middleware
app.use(async (req, res, next) => {
  const token = req.headers['authorization']
  if (token) {
    const payload = await getToken(token)
    if (payload) {
      req.user = payload
      next()
    } else {
      next(new AuthenticationError('Invalid token'))
    }
  } else {
    next(new AuthenticationError('No token provided'))
  }
})

if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: ['https://studio.apollographql.com', 'http://localhost:4011']
    })
  )
}

app.post('/user', async (req, res) => {
  const { email, nickname } = req.body
  if (!email && !nickname) {
    return res.status(400).send({ error: 'Email or nickname are required' })
  }
  const url = `/user`
  const body = { email, nickname }
  const result = await httpClient.post(url, body)
  return result.data[0]
})

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
