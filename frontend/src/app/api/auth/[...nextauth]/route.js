import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // TODO: 实现实际的用户验证逻辑
          // 这里是示例实现，你需要替换为实际的用户验证逻辑
          if (credentials.email && credentials.password) {
            return {
              id: "1",
              email: credentials.email,
              role: "user"
            }
          }
          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.accessToken = account.access_token
        if (profile) {
          token.role = profile.role || "user"
        }
        if (user) {
          token.role = user.role || "user"
        }
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.role = token.role || "user"
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // 启用调试模式以获取更多错误信息
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }