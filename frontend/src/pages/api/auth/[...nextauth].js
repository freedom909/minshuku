import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import dotenv from "dotenv";
dotenv.config();  // Load environment variables
export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        }),

    ],
    pages: {
        signIn: "/auth",    // 自定义登录页
        error: "/auth",     // 登录错误也跳这里
      },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id;
            session.user.email = token.email;
            return session;
        },
    },
});
//console.log("NEXT_PUBLIC_GOOGLE_CLIENT_ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
//console.log("NEXT_PUBLIC_GOOGLE_CLIENT_SECRET:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET);