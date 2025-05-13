import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dotenv from "dotenv";

dotenv.config(); // Load env vars
export default async function authHandler(req, res) {
  if (req.method === 'GET' && req.url.includes('/callback/google')) {
    const parsedUrl = new URL(`http://localhost:3000${req.url}`); // adjust base if needed
    const code = parsedUrl.searchParams.get('code');
    console.log('📥 Raw code from callback route:', code);
  }
  return await NextAuth(req, res, {
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
    async redirect({ url, baseUrl }) {
      // Log the raw code from URL
      if (url.includes('code=')) {
        console.log('🔑 Raw OAuth code:', new URL(url).searchParams.get('code'));
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
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
}