class OAuthLoginAdapter {
  constructor({ oauthService, userService, tokenService }) {
    this.oauthService = oauthService;
    this.userService = userService;
    this.tokenService = tokenService;
  }

  async login(provider, payload) {
    const profile = await this.oauthService.login(provider, payload);

    const user = await this.userService.findOrCreateOAuthUser(profile);

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id,
      role: user.role,
    });

  if (!user.id) {
    user.id = user._id?.toString() ?? "debug-user-id";
  }
    return { accessToken, user };
  }
}

export default OAuthLoginAdapter;
