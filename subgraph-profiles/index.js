import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import initProfileContainer from '../services/DB/initProfileContainer.js';
import cors from 'cors';
import dotenv from 'dotenv';
import resolvers from './resolvers.js';

dotenv.config();

import morgan from "morgan";
import UserService from "../services/userService/index.js";


dotenv.config();

const typeDefs = gql(readFileSync("./schema.graphql", { encoding: "utf-8" }));

const createApolloServer = (container) => {
  return new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
    csrfPrevention: false,
    formatError: (error) => {
      console.error("GraphQL Error:", error);
      return error;
    },
    includeStacktraceInErrorResponses: true,
    introspection: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer: container.httpServer }),
      {
        async serverWillStart() {
          console.log("🚀 Server is starting...");
          return {
            async drainServer() {
              console.log("🛑 Draining server...");
              await mongoose.disconnect();
            },
          };
        },
      },
    ],
  });
};

const createContext =
  (container) =>
    async ({ req }) => {
      if (!req) {
        console.error("Request object is missing in context creation.");
        return {};
      }

      const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
      console.log("Client IP:", ip);
      return {
        token: req.headers.authorization || "",
        container,
        ip,
        req,
        userService: new UserService({
          profileRepository: container.profileRepository,
          profileService: container.profileService,
        }),
      };

    };

const startApolloServer = async () => {
  try {
    const container = await initProfileContainer();
    const app = express();

    const httpServer = http.createServer(app);
    container.httpServer = httpServer;

    const server = createApolloServer(container);
    await server.start();

    // 🔹 Middleware setup
    // Apply middleware in correct order
    app.use(morgan("dev")); // HTTP logger
    // app.use(router); // <--- Moved here (AFTER await server.start)

    app.use(express.json()); // <--- Moved here (AFTER await server.start)

    // 🔹 Health check endpoint — MUST be placed outside Apollo middleware
    app.get("/health", async (req, res) => {
      console.log("Health check received");
      try {
        const mongooseConn = mongoose.connection;
        if (mongooseConn.readyState !== 1) {
          throw new Error("MongoDB not connected");
        }
        await mongooseConn.db.admin().ping();
        res.status(200).json({ status: "healthy" });
      } catch (error) {
        console.error("Health check failed:", error);
        res.status(503).json({ status: "unhealthy", error: error.message });
      }
    });

    // 🔹 CORS + Apollo Middleware
    app.use(
      "/graphql",
      //checkApiKey
      cors({
        origin: ["http://localhost:3000", "http://localhost:4030"],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      }),

      expressMiddleware(server, {
        context: createContext(container),
      })
    );

    // Start HTTP server
    httpServer.listen({ port: 4030 }, () =>
      console.log("✅ Server ready at http://localhost:4030/graphql")
    );
  } catch (error) {
    console.error("❌ Error starting Apollo Server:", error);
  }
};

startApolloServer();
