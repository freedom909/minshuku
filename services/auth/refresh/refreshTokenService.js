// services/auth/refresh/refreshTokenService.js
export default class RefreshTokenService {
  constructor({ refreshRepo, tokenService, userService }) {
    this.refreshRepo = refreshRepo;
    this.tokenService = tokenService;
    this.userService = userService;
  }

  async rotate(oldToken) {
    const hash = this.tokenService.hashRefreshToken(oldToken);
    const stored = await this.refreshRepo.findValid(hash);

    if (!stored) {
      throw new Error("REFRESH_TOKEN_REUSE_DETECTED");
    }

    // revoke old
    await this.refreshRepo.revoke(stored.id);

    // create new
    const newToken = this.tokenService.generateRefreshToken();
    const newHash = this.tokenService.hashRefreshToken(newToken);

    await this.refreshRepo.create({
      userId: stored.userId,
      tokenHash: newHash,
      expiresAt: new Date(Date.now() + 30 * 86400000),
    });

    const user = await this.userService.findById(stored.userId);

    return {
      accessToken: this.tokenService.signAccessToken({
        sub: user.id,
        role: user.role,
      }),
      refreshToken: newToken,
      user,
    };
  }
}
