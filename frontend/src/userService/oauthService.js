//frontend/ src/userService/oauthService.js
import config from "@/config/config.js";

// Define the GraphQL endpoint URL
const SUBGRAPH_AUTH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL || "http://localhost:4010/graphql";

class OAuthService {
  constructor() {
    this.token = null;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("jwt_token");
    }
  }

  async login(email, password) {
    try {
      const query = `
                mutation Login($input: LoginInput!) {
                    login(input: $input) {
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
                        token
                    }
                }
            `;

      const response = await fetch(SUBGRAPH_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              email,
              password,
            },
          },
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(result.errors[0].message);
      }

      const loginResult = result.data.login;

      if (!loginResult.success) {
        throw new Error(loginResult.message || "登录失败");
      }

      // Store JWT token
      if (loginResult.token) {
        localStorage.setItem("jwt_token", loginResult.token);
        this.token = loginResult.token;
      }

      return {
        success: true,
        user: loginResult.user,
        token: loginResult.token,
      };
    } catch (error) {
      console.error("登录失败:", error);
      return {
        success: false,
        error: error.message || "登录过程中发生错误",
      };
    }
  }

  logout() {
    if (typeof window === "undefined") return;

    // 清除本地存储的令牌
    localStorage.removeItem("jwt_token");
    this.token = null;

    // 可以在这里添加其他清理操作，如清除用户状态等
    console.log("User logged out");
  }

  getToken() {
    return this.token;
  }

  async signIn(userData) { // is signIn method right here?
    try {
      const query = `
               mutation SignIn($input: SignInInput!) {
  signIn(input: $input) {
    role
    success
    userId
    refreshToken
    email
    token {
      accessToken {
        token
        expiresAt
      }
    }
  }
}
 `;

      // 准备发送到后端的用户数据
      const oauthInput = {
        email: userData.email,
        name: userData.name || "",
        picture: userData.image || "",
        provider: userData.provider || "google",
        providerId: userData.id || "",
        accessToken: userData.accessToken || "",
      };

      // 发送请求到后端验证用户并保存到数据库
      let response;
      try {
        response = await fetch(SUBGRAPH_AUTH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: {
              input: oauthInput,
            },
          }),
          credentials: "include",
        });
        console.log("Response from backend:", response);
      } catch (err) {
        console.error("Network or fetch error:", err);
        throw err;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error("GraphQL errors:", result.errors);
        throw new Error(result.errors[0].message);
      }

      const oauthResult = result.data.signIn;

      if (!oauthResult.success) {
        throw new Error(oauthResult.message || "OAuth 登录失败");
      }

      // 存储JWT令牌
      if (oauthResult.auth?.token) {
        localStorage.setItem("jwt_token", oauthResult.auth.token);
        this.token = oauthResult.auth?.token;
      }

      return {
        success: true,
        user: oauthResult.user,
        token: oauthResult.auth?.token,
        message: oauthResult.message,
      };
    } catch (error) {
      console.error("OAuth 登录失败:", error);
      return {
        success: false,
        error: error.message || "OAuth 登录过程中发生错误",
      };
    }
  }
}

// Export the class instead of a singleton instance
export default OAuthService;
