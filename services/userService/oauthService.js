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
  }

  signInWithProvider({provider, token, refreshToken, oauthId}) {
    switch (provider) {
      case "GOOGLE":
        return this.signInWithGoogle({ token, refreshToken, oauthId });
      case "APPLE":
        return this.signInWithApple({ token, refreshToken, oauthId });
      case "FACEBOOK":
        return this.signInWithFacebook({ token, refreshToken, oauthId });
        default:
          throw new GraphQLError("Unsupported provider", {
            extensions: {
              code: "UNSUPPORTED_PROVIDER",
              provider,
            },
          });
      }
  }
 
  async signInWithGoogle({ token, refreshToken, oauthId }) {
    try {
      this.googleClient = googleClient;
  
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  console.log("Google token verified successfully");
      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;
      const googleOAuthId = payload.sub;
  
      const finalOAuthId = oauthId || googleOAuthId;
  
      let user = await this.userRepository.findByOAuthId("GOOGLE", finalOAuthId);
  
      if (!user) {
        user = await this.userRepository.createOAuthUser({
          email,
          name,
          picture,
          oauthId: finalOAuthId,
          provider: "GOOGLE",
          role: "GUEST",
          refreshToken,
        });
      }
  
      return user;
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

      if (!user) {
        user = await this.userRepository.createOAuthUser({
          email,
          name,
          picture: response.data.picture?.data?.url,
          oauthId: finalOAuthId,
          provider: "FACEBOOK",
          role: "GUEST",
          refreshToken,
        });
      }

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
