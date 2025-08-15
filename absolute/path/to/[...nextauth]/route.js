// ... existing code ...
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // 配置可选参数
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  }),
  FacebookProvider({
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  }),
  GithubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET
  }),
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      try {
        const { email, password } = credentials;

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        // 调用后端 GraphQL API 进行本地登录验证
        const response = await axios.post("http://localhost:4010/graphql", {
          query: `
            mutation SignIn($input: SignInInput!) {
              signIn(input: $input) {
                code
                auth {
                  token
                  userId
                  role
                  user {
                    firstname
                    lastname
                    email
                  }
                }
                success
                message
              }
            }
          `,
          variables: {
            input: { email, password }
          }
        });

        const result = response.data?.data?.signIn;

        const { auth, success, message } = result;

        if (!success || !auth?.token || !auth?.userId) {
          throw new Error(message || "Authentication failed");
        }

        return {
          id: auth.userId,
          email: auth.user.email,
          name: `${auth.user.firstname} ${auth.user.lastname}`,
          role: auth.role,
          token: auth.token
        };

      } catch (error) {
        console.error("Authorization error:", error);
        throw new Error(error.message || "Authentication failed");
      }
    }
  }),
],
// ... existing code ...