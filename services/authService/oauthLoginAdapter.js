// services/authService/oauthLoginAdapter.js
import { GraphQLError } from "graphql";

export default class OAuthLoginAdapter {
  constructor({ userService, tokenService, oauthService }) {
    this.userService = userService;   // User domain
    this.tokenService = tokenService; // RS256 TokenService
    this.oauthService = oauthService; // Google / Apple
  }

  /**
   * OAuth 登录入口
   */
  async login({ provider, providerAccountId, accessToken }) {
    // 1️⃣ 校验 OAuth token + 获取 profile
    const profile = await this.oauthService.verify(provider, accessToken);

    if (!profile) {
      throw new GraphQLError("Invalid OAuth token");
    }

    if (profile.id !== providerAccountId) {
      throw new GraphQLError("OAuth identity mismatch");
    }

    // 2️⃣ 找或创建用户（领域逻辑）
    const user = await this.userService.findOrCreateOAuthUser({
      provider,
      providerAccountId: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    // 3️⃣ 签发 Access Token（RS256 / JWKS）
    const accessTokenJwt = this.tokenService.signAccessToken({
      userId: user.id,
      role: user.role,
    });

    // 4️⃣ 返回“统一登录结果”
    return {
      success: true,
      code: 200,
      message: "OAuth login success",
      accessToken: accessTokenJwt,
      user,
    };
  }
}
