//services/usserService/oauthService.js
import axios from "axios";
import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from "graphql";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import UserRepository from "../repositories/userRepository.js";
import dotenv from "dotenv";
dotenv.config();
import pkg from "jsonwebtoken";
const { verify } = pkg;
import jwksClient from "jwks-rsa";
import sendOAuthRequestToSubgraph  from "./utils/sendOAuthRequestToSubgraph.js";

function getAppleKey(header, callback) {
  const appleClient = jwksClient({
    jwksUri: "https://appleid.apple.com/auth/keys",
  });
  appleClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class OAuthService extends RESTDataSource {
  constructor({ tokenService, userRepository }) {
    super();
    if (!tokenService || !userRepository) {
      throw new Error("OAuthService requires tokenService and userRepository");
    }
    this.tokenService = tokenService;
    this.userRepository = userRepository;
  }

  async authenticate(provider, token) {
        console.log("Token type:", typeof token); // Should print: string
    console.log("Token value:", token);       // Should print the JWT string

    try {
      if (!provider || !token) {
        throw new GraphQLError("Provider and access token are required", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      let userInfo;
      switch (provider.toLowerCase()) {
        case "google":
          userInfo = await this.verifyGoogleToken(token);
          break;
        case "facebook":
          userInfo = await this.verifyFacebookToken(token);
          break;
        case "apple":
          userInfo = await this.verifyAppleToken(token);
          break;
        default:
          throw new GraphQLError("Unsupported OAuth provider", {
            extensions: { code: "UNSUPPORTED_PROVIDER" },
          });
      }

      if (!userInfo || !userInfo.email) {
        throw new GraphQLError("Failed to retrieve user info", {
          extensions: { code: "INVALID_OAUTH_TOKEN" },
        });
      }

      let user = await this.userRepository.findByOAuthId(
        provider.toUpperCase(),
        userInfo.id
      );
      if (!user) {
        // 🟡 New logic: Check if the email already exists
        const existingUser = await this.userRepository.getUserByEmailFromDb(
          userInfo.email
        );
        if (existingUser) {
          // Optionally update oauthId / provider info here if needed
          user = existingUser;
        } else {
          let fullName = "";

          if (typeof userInfo.name === "string" && userInfo.name.trim()) {
            fullName = userInfo.name.trim();
          } else if (
            typeof userInfo.fullName === "string" &&
            userInfo.fullName.trim()
          ) {
            fullName = userInfo.fullName.trim();
          } else {
            const constructed = `${userInfo.given_name || ""} ${
              userInfo.family_name || ""
            }`.trim();
            fullName = constructed || "Unnamed User";
          }
          console.log("Resolved fullName:", fullName);

          user = await this.userRepository.createOAuthUser({
            email: userInfo.email,
            name: fullName,
            picture: userInfo.picture,
            oauthId: userInfo.id,
            provider,
            role: "GUEST",
            refreshToken: null,
          });
        }
      }
      if (user) {
        console.log("User:", user);
      }
      const accessToken = await this.tokenService.generateToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await this.userRepository.updateRefreshToken(user._id, refreshToken);
      
      console.log("Preparing to call sendOAuthRequestToSubgraph...");

      const signInResponse = await sendOAuthRequestToSubgraph(provider, accessToken);
      
      console.log("signInResponse received:", signInResponse);
      
      return signInResponse;
    } catch (error) {
      console.error("Authentication error:", error);
      throw new GraphQLError("Authentication failed", {
        extensions: { code: "AUTHENTICATION_FAILED" },
      });
    }
  }

  async verifyGoogleToken(token) {
    console.log("Google token:", token);
    try {
      this.googleClient = googleClient;
  
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      console.log("Expected audience:", process.env.GOOGLE_CLIENT_ID);

      const payload = ticket.getPayload();
      console.log("User payload from Google:", payload);
  
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      throw new GraphQLError("Invalid Google token", {
        extensions: {
          code: "INVALID_GOOGLE_TOKEN",
          provider: "GOOGLE",
          error,
        },
      });
    }
  }
  
  

  async signInWithFacebook({ token, refreshToken, oauthId }) {
    try {
      const response = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          access_token: token,
          fields: "id,name,email,picture",
        },
      });

      const { id: facebookOAuthId, fullName, email } = response.data;

      const finalOAuthId = oauthId || facebookOAuthId;

      let user = await this.userRepository.findByOAuthId(
        "FACEBOOK",
        finalOAuthId
      );
      const name =
        fullName?.trim() ||
        `${response.data.given_name || ""} ${response.data.family_name || ""}`.trim() ||
        "Unnamed User";

      user = await this.userRepository.createOAuthUser({
        email: payload.email,
        name: fullName,
        picture: payload.picture,
        oauthId: payload.id,
        provider,
        role: "GUEST",
        refreshToken: null,
      });
      console.log("Creating user with:", payload);

      return user;
    } catch (error) {
      throw new GraphQLError("Invalid Facebook token", {
        extensions: {
          code: "INVALID_FACEBOOK_TOKEN",
          provider: "FACEBOOK",
          error,
        },
      });
    }
  }
}
export default OAuthService;
