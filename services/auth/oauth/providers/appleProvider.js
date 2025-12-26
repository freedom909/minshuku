import jwt from 'jsonwebtoken';

export default class AppleProvider {
async verify(identityToken) {
    const decoded = jwt.decode(identityToken, { complete: true });

    if (!decoded?.payload?.sub || !decoded?.payload?.email) {
      throw new Error("Invalid Apple identity token");
    }

    return {
      id: decoded.payload.sub,
      email: decoded.payload.email,
      name: null,        // Apple often doesn't provide name
      picture: null,
    };
  }
}