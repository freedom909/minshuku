// services/auth/oauth/providers/google.provider.js
export default {
  async verify({ code }) {
    const googleUser = await verifyGoogleToken(code);

    return {
      providerId: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      avatar: googleUser.picture,
    };
  },
};
