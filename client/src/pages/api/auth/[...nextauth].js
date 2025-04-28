import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import dotenv from "dotenv";
dotenv.config();  // 加载环境变量

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!clientId || !clientSecret) {
    console.error('缺少 Google 客户端 ID 或客户端密钥，请检查环境变量。');
}

if (!nextAuthSecret) {
    console.error('缺少 NEXTAUTH_SECRET，请检查环境变量。');
}

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: clientId,
            clientSecret: clientSecret,
        }),
    ],
    secret: nextAuthSecret,
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
console.log("GOOGLE_CLIENT_ID:", clientId );
console.log("GOOGLE_CLIENT_SECRET:", clientSecret);
