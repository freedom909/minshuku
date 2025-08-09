//frontend/src/pages/api/auth/[...nextauth].js
// Update NextAuth import to use require syntax
const { default: NextAuth } = require('next-auth');
import bcrypt from "bcryptjs";
import localAuthService from "@/userService/localAuthService";
import oauthService from "@/userService/oauthService";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

// Use require syntax for all providers for consistency
const { default: Google } = require('next-auth/providers/google');
const { default: Facebook } = require('next-auth/providers/facebook');
const { default: Github } = require('next-auth/providers/github');
const { default: Credentials } = require('next-auth/providers/credentials');

const handler = NextAuth({
  providers: [
    Google({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
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


    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const result = await localAuthService.authenticate(
            credentials.email,
            credentials.password
          );

          if (!result.success) {
            throw new Error(result.error || "Invalid credentials");
          }

          return {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name
          };
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      }
    }),

  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("👤 Sign-in callback:", user, account, profile);

      if (!user) throw new Error("No user found");

      if (["google", "facebook", "github"].includes(account.provider)) {
        try {
          const token = account.id_token || account.access_token;

          console.log(`Calling subgraph with ${account.provider} token:`, token);

          const response = await oauthService.sendOAuthRequestToSubgraph(
            account.provider,
            token
          );

          console.log("OAuth response from subgraph:", response);

          // ✅ Allow login to continue and still let adapter save user
          if (!response?.success) {
            console.error("OAuth login failed:", response);
            return false;
          }
        } catch (err) {
          console.error("OAuth backend call failed:", err?.message || err);
          return false;
        }
      }

      return true;
    },

    adapter: MongoDBAdapter(clientPromise),


    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.picture;
        token.accessToken = user.token; // Optional
      }
      return token;

    },
    session: async ({ session, token }) => {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };