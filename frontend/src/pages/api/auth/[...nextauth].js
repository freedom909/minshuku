import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dotenv from "dotenv";

dotenv.config(); // Load env vars

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth",   // Custom sign-in page
    error: "/auth",    // Redirect errors here too
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          picture: token.picture,
        };
      }
      return session;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Debug log (can remove in prod)
        console.log("Google Login Profile:", profile);
        token.id = profile.sub || profile.id;
        token.name = profile.name;
        token.email = profile.email;
        
       
        if (profile.picture) {  
            token.picture = profile.picture;
        }
        console.log("Profile Picture From Google:", profile.picture);
      }
      return token;
    },
  },
  // Optional: for troubleshooting
  debug: true,
});
