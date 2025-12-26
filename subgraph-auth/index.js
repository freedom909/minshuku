import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Set default key paths if they are not defined in the .env file
if (!process.env.JWT_PRIVATE_KEY_PATH) {
  process.env.JWT_PRIVATE_KEY_PATH = path.join(__dirname, "../keys/jwt-private.pem");
}
if (!process.env.JWT_PUBLIC_KEY_PATH) {
  process.env.JWT_PUBLIC_KEY_PATH = path.join(__dirname, "../keys/jwt-public.pem");
}

import applyAuthDirective from "../infrastructure/authz/applyAuthDirective.js";
applyAuthDirective(resolvers);
import express from "express";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import initAuthContainer from "../services/DB/initAuthContainer.js";
import { readFileSync } from "fs";
import { gql } from "graphql-tag";
import resolvers from "./resolvers.js";
import cors from "cors";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import mongoose from "mongoose";
// import jwksRoute from "../services/http/jwksRoute.js";
import { getJWKS } from "../services/auth/jwks.js";
import morgan from "morgan";
import UserService from "../services/userService/index.js";
import checkApiKey from "./utils/checkApiKey.js";
import authLimiter from "../infrastructure/middleware/authLimiter.js"; // Adjust path as needed
import TokenService from "../services/userService/tokenService.js";

const schemaFiles = ["schema.graphql", "directives.graphql"];
const typeDefs = schemaFiles.map((file) => {
  return gql(readFileSync(join(__dirname, file), { encoding: "utf-8" }));
});

const createApolloServer = (container) => {
  return new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),// ❌ Error starting Apollo Server: GraphQLError: Unknown type User
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
          accountLockService: container.resolve("accountLockService"),
          localAuthService: container.resolve("localAuthService"),
          oauthService: container.resolve("oauthService"),
          tokenService: container.resolve("tokenService"),
        }),

      };
    };


const startApolloServer = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    console.log("All env variables:", process.env);
    const container = await initAuthContainer();
    const app = express();

    const httpServer = http.createServer(app);
    container.httpServer = httpServer;

    const server = createApolloServer(container);
    await server.start();

    // 🔹 Middleware setup
    // Apply middleware in correct order
    app.use(morgan("dev")); // HTTP logger
    // app.use(router); // <--- Moved here (AFTER await server.start)
    app.use(authLimiter); // <--- Moved here (AFTER await server.start)
    app.use(express.json()); // <--- Moved here (AFTER await server.start)

    // Optional: Log all incoming requests (headers + body)
    app.use((req, res, next) => {
      if (
        req.body?.operationName === "validateOAuthToken" ||
        req.body?.operationName === "signIn"
      ) {
        console.log(`[Filtered Log] Operation: ${req.body.operationName}`);
      }
      next();
    });
    // 🔐 JWKS endpoint（必须在 GraphQL 之前）
    app.get("/.well-known/jwks.json", async (req, res, next) => {
      try {
        const jwks = await getJWKS();
        res.json(jwks);
      } catch (err) {
        next(err);
      }
    });
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
      //checkApiKey,

      authLimiter,
      cors({
        origin: ["http://localhost:3000", "http://localhost:4010"],
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      }),

      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.cookies?.accessToken;
          const tokenService = container.resolve("tokenService");

          const user = token
            ? tokenService.verifyAccessToken(token)
            : null;

          return {
            user,
            req,
            container, // ✅ 必须注入
          };
        },
      })


    );

    // Start HTTP server (port configurable)
    const port = Number(process.env.AUTH_PORT) || 4010;
    httpServer.listen({ port }, () =>
      console.log(`✅ Server ready at http://localhost:${port}/graphql`)
    );
  } catch (error) {
    console.error("❌ Error starting Apollo Server:", error);
  }
};

startApolloServer();