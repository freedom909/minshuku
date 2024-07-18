import { OAuth2Client } from 'google-auth-library';
import pkg from 'jsonwebtoken';
const { sign } = pkg;

class GoogleLogin {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT);
  }

  async verifyGoogleToken(token) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT
    });
    return ticket.getPayload();
  }

  generateToken(user) {
    return sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  }
}

export default GoogleLogin;
