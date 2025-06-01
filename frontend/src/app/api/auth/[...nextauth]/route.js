import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import localAuthService from "@/userService/localAuthService";
import oauthService from "@/userService/oauthService";


const handler = NextAuth({
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
          const user = await localAuthService.authenticate(
            credentials.email,
            credentials.password
          );
          
          if (!user) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user) throw new Error("No user found");
    
      if (account.provider === "google") {
        // call your backend here (e.g., subgraph-users)
        try {
          const token = account.id_token || account.access_token;
         
          console.log("Calling subgraph with id_token:", token);
          const response = await oauthService.sendOAuthRequestToSubgraph(
            "google",
            token
          );
          
          console.log("OAuth response from subgraph:", response);
          if (!response?.success) {
            console.error("OAuth login failed:", response);
            return false; // ⛔ Login will fail and redirect
          }
    
          return true;
        } catch (err) {
          console.error("OAuth backend call failed:",  err?.message || err);
          return false;
        }
      }
    
      return true;
    
    },
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