//frontend/src/app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

const SUBGRAPH_AUTH_URL =
  process.env.SUBGRAPH_AUTH_URL || "http://localhost:4010/graphql";

async function oauthLoginToBackend({
  provider,
  providerAccountId,
  accessToken,
}) {
  const res = await fetch(SUBGRAPH_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // ✅ OAuth token 只在 Header
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: `
        mutation OAuthLogin($input: OAuthLoginInput!) {
          oauthLogin(input: $input) {
            
            user {
              id
              role
            }
          }
        }
      `,
      variables: {
        input: {
          provider: provider.toUpperCase(),
          providerAccountId, // ✅ 必须
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Backend OAuth failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data.oauthLogin;
}


const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt", // ⚠️ 注意：这是 NextAuth 自己的 session JWT
  },

  callbacks: {
    /**
     * OAuth 成功后触发
     */
    async signIn({ account, profile, user }) {
      if (!account?.access_token ||!profile?.sub) return false;

      try {
        const backendAuth = await oauthLoginToBackend({
          provider: account.provider,
          providerAccountId: profile.sub,
          accessToken: account.access_token
        });

        // 把 backend JWT 临时挂到 user 上
    user.backendUserId = backendAuth.user.id;
    user.role = backendAuth.user.role;

        return true;
      } catch (err) {
        console.error("OAuth backend login failed:", err);
        return false;
      }
    },

    /**
     * 控制 NextAuth 自己的 JWT
     */
    async jwt({ token, user }) {
      if (user) {
    token.userId = user.backendUserId;
    token.role = user.role;
      }
      return token;
    },

    /**
     * 控制前端 session 能看到什么
     */
    async session({ session, token }) {
      // ❗ 前端不直接使用 backend JWT
      session.user.id = token.userId;
      session.user.role = token.role;

      // ❌ 不暴露 backend JWT
      // session.backendAccessToken ❌ 不给

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
