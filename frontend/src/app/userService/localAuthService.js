import axios from "axios";
import { sign } from "jsonwebtoken";
import { serialize } from "cookie"; // node-only, not for client-side

const SUBGRAPH_USERS_URL = "http://localhost:4010";
const JWT_SECRET = process.env.JWT_SECRET || "secret-key"; // Must be defined in .env

const loginRequestToSubgraph = `
  mutation loginRequestToSubgraph($email: String!, $password: String!) {
    loginRequestToSubgraph(email: $email, password: $password) {
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
  signUp: async (email, password) => {
    const response = await axios.post(`${SUBGRAPH_USERS_URL}/signup`, {
      email,
      password,
    });
    return response.data;
  },

  signIn: async (email, password, res) => {
    const response = await axios.post(`${SUBGRAPH_USERS_URL}/signin`, {
      email,
      password,
    });

    const user = response.data.user;
    const token = localAuthService.generateToken(user);

    // Set secure, HTTP-only cookie
    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    res.setHeader("Set-Cookie", cookie);

    return { token, user };
  },

  loginViaGraphQL: async (email, password, res) => {
    const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
      query: loginRequestToSubgraph,
      variables: { email, password },
    });

    const tokenData = result.data.data.loginRequestToSubgraph.token;
    const user = { email }; // Expand if the user info is available

    const token = localAuthService.generateToken(user);

    const cookie = serialize("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    res.setHeader("Set-Cookie", cookie);

    return { token, user };
  },

  logout: (res) => {
    const cookie = serialize("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    res.setHeader("Set-Cookie", cookie);
  },

  generateToken: (payload) => {
    return sign(payload, JWT_SECRET, { expiresIn: "1h" });
  },
};

export default localAuthService;
