import axios from "axios";

const SUBGRAPH_USERS_URL = "http://localhost:8010";

const loginRequestToSubgraph = `
  mutation Login($input: SignInInput!) {
    signIn(input: $input) {
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
      }
    }
  }
`;

const registerRequestToSubgraph = `
  mutation Register($input: SignUpInput!) {
    signUp(input: $input) {
      user {
        id
        email
        name
      }
    }
  }
`;

const localAuthService = {
  authenticate: async (email, password) => {
    try {
      const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
        query: loginRequestToSubgraph,
        variables: {
          input: { email, password }
        }
      });

      if (result.data.errors) {
        throw new Error(result.data.errors[0].message);
      }

      const { user } = result.data.data.signIn;
      if (!user) {
        throw new Error("Authentication failed");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      };
    } catch (error) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 
                    error.message || 
                    "Authentication failed");
    }
  },

  register: async (email, password, name) => {
    try {
      const result = await axios.post(`${SUBGRAPH_USERS_URL}/graphql`, {
        query: registerRequestToSubgraph,
        variables: {
          input: { email, password, name }
        }
      });

      if (result.data.errors) {
        throw new Error(result.data.errors[0].message);
      }

      const { user } = result.data.data.signUp;
      if (!user) {
        throw new Error("Registration failed");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email.split('@')[0]
      };
    } catch (error) {
      throw new Error(error.response?.data?.errors?.[0]?.message || 
                    error.message || 
                    "Registration failed");
    }
  }
};

export default localAuthService;