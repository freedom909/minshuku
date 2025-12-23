// services/oauth/OAuthService.js
export default class OAuthService {
  constructor({ googleProvider, githubProvider, appleProvider }) {
    this.providers = {
      GOOGLE: googleProvider,
      GITHUB: githubProvider,
      APPLE: appleProvider,
    };
  }

  async verify(provider, token) {
    const impl = this.providers[provider];

    if (!impl) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return impl.verify(token);
  }
}
