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
    this.googleClient = googleClient;
  }

  async authenticate(provider, token) {
    try {
      if (!provider || !token) {
        throw new GraphQLError("Provider and access token are required", {
          extensions: { code: "INVALID_INPUT" },
        });
      }
  
      const providerKey = provider.toLowerCase();
      let userInfo;
  
      switch (providerKey) {
        case "google":
          userInfo = await this.verifyGoogleToken(token);
          break;
        case "facebook":
          userInfo = await this.verifyFacebookToken(token);
          break;
        case "apple":
          userInfo = await this.verifyAppleToken(token);
          break;
        case "github":
          userInfo = await this.verifyGithubToken(token);
          break;
        default:
          throw new GraphQLError("Unsupported OAuth provider", {
            extensions: { code: "UNSUPPORTED_PROVIDER" },
          });
      }
  
      if (!userInfo || !userInfo.id || !userInfo.email) {
        throw new GraphQLError("Failed to retrieve user info", {
          extensions: { code: "INVALID_OAUTH_TOKEN" },
        });
      }
  
      // 🔍 Step 1: Try to find user by provider + id (OAuth sub)
      let user = await this.userRepository.findByOAuthId(
        provider.toUpperCase(),
        userInfo.id
      );
      console.log("👀 Existing google user by email?", user);
      // ⚠️ Step 2: If not found, fallback to email check
      if (!user) {
        const existingUser = await this.userRepository.getUserByEmailFromDb(
          userInfo.email
        );
        console.log("👀 Existing user by email?", existingUser); // no output here
        if (existingUser) {
          // You can optionally update the OAuth identity info
          user = existingUser;
          // Optional: persist new provider info here
        } else {
          // 🆕 Step 3: Create a new user
          user = await this.userRepository.createOAuthUser({
            email: userInfo.email,
            name: userInfo.name || "Unnamed User",
            picture: userInfo.picture,
            oauthId: userInfo.id,
            provider: provider.toUpperCase(),
            role: userInfo.role || "GUEST",
            refreshToken: null,
          });
        }
      }
  
      // 🔐 Generate tokens
      const accessToken = this.tokenService.generateToken(user);
      const refreshToken = await this.tokenService.generateRefreshToken(user);
  
      user.refreshToken = refreshToken;
      await this.userRepository.updateRefreshToken(user._id, refreshToken);
  
      return {
        code: 200,
        success: true,
        message: "Authentication successful",
        user,
        token: accessToken,
        refreshToken,
        userId: user._id,
        role: user.role,
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
  
      return {
        email: payload.email,
        name:
          payload.name ||
          payload.fullName ||
          `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
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
  
  async verifyGithubToken(token) {
    try {
      const response = await fetch(`https://api.github.com/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
  
      const data = await response.json();
  
      if (!data || data.error) {
        throw new Error(data?.error?.message || "Invalid Github token");
      }
  
      // Optionally get email if not public
      let email = data.email;
      let role=data.role;
  
      if (!email) {
        const emailResponse = await fetch(`https://api.github.com/user/emails`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        });
  
        const emails = await emailResponse.json();
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        email = primaryEmail?.email;
      }
  
      return {
        id: data.id,
        email: email,
        name: data.name || data.login,
        picture: data.avatar_url,
        role: role ||"GUEST", // Or customize based on your logic
      };
    } catch (error) {
      throw new GraphQLError("Invalid Github token", {
        extensions: {
          code: "INVALID_GITHUB_TOKEN",
          provider: "GITHUB",
          error,
        },
      });
    }
  }
  

  async verifyFacebookToken(token) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const data = await response.json();
  
      if (!data || data.error) {
        throw new Error(data?.error?.message || "Invalid Facebook token");
      }
  
      const { id, email, name, picture, role } = data; 

  
      if (!email || !id) {
        throw new GraphQLError("Facebook token did not return required fields", {
          extensions: { code: "INVALID_FACEBOOK_TOKEN" },
        });
      }
  
      return {
        id,
        email,
        name,
        picture: picture?.data?.url || null,
        role: role ||"GUEST", // Or customize based on your logic
      };
    } catch (error) {
      console.error("Error verifying Facebook token:", error);
      throw new GraphQLError("Failed to verify Facebook token", {
        extensions: { code: "TOKEN_VERIFICATION_FAILED" },
      });
    }
  }

  
  async findUserByEmail(email) {
    return await this.userRepository.getUserByEmailFromDb(email);
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
        `${response.data.given_name || ""} ${
          response.data.family_name || ""
        }`.trim() ||
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
