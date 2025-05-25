import { authenticate } from "@/lib/auth";
import axios from "axios";
import bcrypt from 'bcryptjs';

const SUBGRAPH_USERS_URL = "http://localhost:8010";
const SALT_ROUNDS = 12;

const getUserForAuthQuery = `
  query GetUserForAuth($email: String!) {
    users(where: { email: $email }) {
      id
      email
      password
    }
  }
`;

const loginRequestToSubgraph = `
  mutation Login($input: SignInInput!) {
    signIn(input: $input) {
      success
      message
      token {
        accessToken {
          token
          expiresAt
        }
      }
      user {
        id
        email
        name
        nickname
        role
        picture
      }
    }
  }
`;

const registerRequestToSubgraph = `
  mutation Register($input: SignUpInput!) {
    signUp(input: $input) {
      success
      message
      user {
        id
        email
        name
        nickname
        role
        picture
      }
      token {
        accessToken {
          token
          expiresAt
        }
      }
    }
  }
`;

const localAuthService = {
  authenticate: async (email, password) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password presence
      if (!password || password.trim() === '') {
        throw new Error("Password is required");
      }

      const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
        query: loginRequestToSubgraph,
        variables: {
          input: { email, password }
        }
      });
      console.log("Authentication result:", result.data);
      
      if (result.data.errors) {
        throw new Error(result.data.errors[0].message);
      }

      const { user, token } = result.data.data.signIn;
      if (!user || !token) {
        throw new Error("Authentication failed");
      }

      // Store the token
      if (token?.accessToken?.token) {
        localStorage.setItem('jwt_token', token.accessToken.token);
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          nickname: user.nickname,
          role: user.role,
          picture: user.picture
        },
        token: token?.accessToken?.token,
        message: "Authentication successful"
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || 
               error.message || 
               "Authentication failed",
        message: "Authentication failed"
      };
    }
  },

  register: async (userData) => {
    try {
      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error("Email, password, and name are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error("Please enter a valid email address");
      }

      // Validate password strength
      if (userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (!/[A-Z]/.test(userData.password)) {
        throw new Error("Password must contain at least one uppercase letter");
      }
      if (!/[0-9]/.test(userData.password)) {
        throw new Error("Password must contain at least one number");
      }
      if (!/[^A-Za-z0-9]/.test(userData.password)) {
        throw new Error("Password must contain at least one special character");
      }

      // Set default avatar if not provided
      if (!userData.picture) {
        userData.picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
      }

      const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
        query: registerRequestToSubgraph,
        variables: {
          input: {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            nickname: userData.nickname || userData.name,
            picture: userData.picture,
            role: userData.role || 'USER'
          }
        }
      });

      console.log("Registration result:", result.data);
      
      if (result.data.errors) {
        throw new Error(result.data.errors[0].message);
      }

      const { user, token, success, message } = result.data.data.signUp;
      
      if (!success || !user) {
        throw new Error(message || "Registration failed");
      }

      // 如果有token，存储它
      if (token?.accessToken?.token) {
        localStorage.setItem('jwt_token', token.accessToken.token);
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          role: user.role,
          picture: user.picture
        },
        token: token?.accessToken?.token,
        message: message || "Registration successful"
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.errors?.[0]?.message || 
               error.message || 
               "Registration failed",
        message: "Registration failed"
      };
    }
  }
};

export default localAuthService;