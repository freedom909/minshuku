export default class OAuthService {
  constructor({ googleProvider, facebookProvider, githubProvider }) {
    this.providers = {
      GOOGLE: googleProvider,
      FACEBOOK: facebookProvider,
      GITHUB: githubProvider,
    };
  }

  async login(providerName, payload) {
    const provider = this.providers[providerName];

    if (!provider) {
      throw new Error(`Unsupported OAuth provider: ${providerName}`);
    }

    return provider.verify(payload);
  }
}
