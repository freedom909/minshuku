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
import generateRefreshToken from "./tokenService.js";

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
          const fullName =
            userInfo.name?.trim() ||
            userInfo.fullName?.trim() ||
            `${userInfo.given_name || ""} ${
              userInfo.family_name || ""
            }`.trim() ||
            "Unnamed User";

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

      const accessToken = this.tokenService.generateToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await this.userRepository.updateRefreshToken(user._id, refreshToken);

      return { 
        code:200,
        success:true,
        message: "Authentication successful",
        user, token: accessToken, refreshToken, userId: user._id, role: user.role,
       };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new GraphQLError("Authentication failed", {
        extensions: { code: "AUTHENTICATION_FAILED" },
      });
    }
  }

  async verifyGoogleToken(token) {
    try {
      this.googleClient = googleClient;

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const name =
        payload.name ||
        payload.fullName ||
        `${payload.given_name || ""} ${payload.family_name || ""}`.trim();

      return {
        email: payload.email,
        name,
        picture: payload.picture,
        id: payload.sub,
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

      const { id: facebookOAuthId, name, email } = response.data;

      const finalOAuthId = oauthId || facebookOAuthId;

      let user = await this.userRepository.findByOAuthId(
        "FACEBOOK",
        finalOAuthId
      );
      const fullName =
        userInfo.name?.trim() ||
        userInfo.fullName?.trim() ||
        `${userInfo.given_name || ""} ${userInfo.family_name || ""}`.trim() ||
        "Unnamed User";

      user = await this.userRepository.createOAuthUser({
        email: userInfo.email,
        name: fullName,
        picture: userInfo.picture,
        oauthId: userInfo.id,
        provider,
        role: "GUEST",
        refreshToken: null,
      });
      console.log("Creating user with:", userInfo);

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
