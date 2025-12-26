// services/auth/oauth/OAuthService.js
export default class OAuthService {
  constructor({ providers, userService, tokenService}) {
    this.providers = providers;
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async login(providerName, payload) {
  console.log("🧪 OAuthService.login called");
  console.log("🧪 providerName =", providerName);
  console.log("🧪 providers keys =", Object.keys(this.providers));

    const provider = this.providers[providerName];
    if (!provider) throw new Error("UNSUPPORTED_PROVIDER");

    const profile = await provider.verify(payload);
    console.log("Profile:", profile);//no output,so verify method is not working
    const user = await this.userService.findOrCreateOAuthUser(profile);

    const accessToken = this.tokenService.signAccessToken({
      sub: user.id,
      role: user.role,
    });



    return { user, accessToken };
  }
}
