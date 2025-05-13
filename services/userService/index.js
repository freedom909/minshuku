//services/userService/index.js
import { GraphQLError } from 'graphql';

class UserService {
  constructor({ localAuthService = null, oauthService = null, tokenService }) {
    this.localAuthService = localAuthService;
    this.oauthService = oauthService;
    this.tokenService = tokenService;
  }

  async login(email, password) {
    if (!this.localAuthService) {
      throw new Error('LocalAuthService is not available.');
    }
  
    let user;
    try {
      user = await this.localAuthService.login(email, password);
    } catch (err) {
      throw new GraphQLError("Invalid email or password", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
  
    const token = await this.tokenService.generateToken(user);
  
    return {
      code: 200,
      success: true,
      message: "Login successful",
      token,
      userId: user._id?.toString?.() || user.id,
      role: user.role,
    };
  }
  

  async oauthLogin(input) {
    if (!this.oauthService) {
      throw new Error('OAuthService is not available.');
    }

    const providerUser = await this.oauthService.authenticate(input.provider, input.token);

    if (!providerUser) {
      throw new GraphQLError("Invalid provider token", {
        extensions: { code: "INVALID_PROVIDER_TOKEN" },
      });
    }

    const user = await this.oauthService.loginWithProvider(providerUser);

    if (!user || !user._id) {
      throw new GraphQLError("Login failed", {
        extensions: { code: "LOGIN_FAILED" },
      });
    }

    const token = await this.tokenService.generateToken(user);

    return {
      code: 200,
      success: true,
      message: "Login successful",
      token,
      userId: user._id.toString(),
      role: user.role,
    };
  }
}

export default UserService;
