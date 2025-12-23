// services/oauth/providers/GoogleOAuthProvider.js
import { OAuth2Client } from "google-auth-library";

export default class GoogleOAuthProvider {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verify(idToken) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    return {
      id: payload.sub,      // providerAccountId
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: "GOOGLE",
    };
  }
}
