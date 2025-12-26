import { OAuth2Client } from 'google-auth-library';

export class GoogleOAuth {
  constructor({ clientId }) {
    this.clientId = clientId;
    this.client = new OAuth2Client(clientId);
  }

  async verify({ idToken }) {
    if (!idToken) {
      throw new Error('Missing Google idToken');
    }

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return {
      provider: 'GOOGLE',
      providerAccountId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  }
}
