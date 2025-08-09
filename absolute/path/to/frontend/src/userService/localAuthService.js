// 确认 URL 正确且后端服务正在运行
const SUBGRAPH_USERS_URL = "http://localhost:4010/graphql";

// 确认查询语法正确
const loginRequestToSubgraph = `
  mutation Login($input: SignInInput!) {
    signIn(input: $input) {
      success
      message
      token {
        accessToken
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

const localAuthService = {
  async authenticate(email, password) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (!password || password.trim() === "") {
        throw new Error("Password is required");
      }

      const response = await axios.post(SUBGRAPH_USERS_URL, {
        query: loginRequestToSubgraph,
        variables: { input: { email, password } },
      });

      const result = response.data;

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const { user, code } = result.data.signIn;
      if (!user) {
        throw new Error("Authentication failed");
      }

      // 这里我们假设 code 可能是一个访问令牌或会话标识符
      if (code) {
        localStorage.setItem("jwt_token", code);
      }

      return {
        success: true,
        user,
        token: code,
        message: "Authentication successful",
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        success: false,
        error: error.message || "Authentication failed",
        message: "Authentication failed",
      };
    }
  },
};