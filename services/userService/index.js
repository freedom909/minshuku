//services/userService/index.js

import validateLoginResponse from "./utils/validateLoginResponse.js";


class UserService {
  constructor({ localAuthService, userRepository, passwordHasher, tokenService, accountLockService,oauthService }) {
    this.localAuthService = localAuthService;
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
    this.oauthService = oauthService;
  }

  async localLogin(email, password) {
    console.log('Starting local login process for email:', email);

    if (!this.localAuthService) {
      throw new GraphQLError('Local authentication service is not configured', {
        extensions: { code: 'SERVICE_UNAVAILABLE' }
      });
    }
    return await this.localAuthService.localLogin(email, password);
  }



  async oauthLogin(provider, token) {
    console.log("Authenticating with provider:", provider); 
    console.log("Token received:", token);
    return await this.oauthService.authenticate(provider, token);
  }



  async handleGoogleOAuth(token) {
    return await this.oauthService.handleGoogleOAuth(token);
  }
}

export default UserService;
