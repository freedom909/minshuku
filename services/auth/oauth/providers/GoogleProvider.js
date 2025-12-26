// services/auth/oauth/providers/GoogleProvider.js
export default class GoogleProvider {
  name = "google"; //what does it mean? where is from the name ?

  async verify(payload) {
    // payload = { idToken }
    const profile = await verifyGoogleIdToken(payload.idToken);

    return {
      provider: "google",
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    };
  }
}
