// src/userService/localAuthService.js
import axios from "axios";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";

const SUBGRAPH_USERS_URL = "http://localhost:4010";
const JWT_SECRET = process.env.JWT_SECRET || "good";


const loginRequestToSubgraph = `
  mutation Login($input: SignInInput!) {
    signIn(input: $input) {
      token {
        accessToken {
          token
          expiresAt
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;


const localAuthService = {
  login: async (email, password, res) => {
    try {
      const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
        query: loginRequestToSubgraph,
        variables: {
          input: {
            email,
            password,
          },
          
        },
      });

      const tokenData = result.data.data.signIn.token;
      if (!tokenData) {
        throw new Error("Login failed: No token received");
      }

      const user = { email }; // Add other user details if needed
      const token = tokenData.accessToken.token;

      const cookie = serialize("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });

      res.setHeader("Set-Cookie", cookie);
      return { token, user };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid login credentials");
    }
  },
};

export default localAuthService;
