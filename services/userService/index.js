//services/userService/index.js

import validateLoginResponse from './utils/validateLoginResponse.js';
import { GraphQLError } from 'graphql';

class UserService {
  constructor({ localAuthService = null, oauthService, tokenService, accountLockService = null }) {
    this.localAuthService = localAuthService;
    this.oauthService = oauthService;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
  }

  async oauthLogin(provider, token) {
    console.log("Authenticating with provider:", provider); //no output, maybe the frontend did not send the anything
console.log("Token received:", token);
    return await this.oauthService.authenticate(provider, token);
  }

  async login(email, password) {
    const response = await this.localAuthService.login(email, password);
    return await validateLoginResponse(response);
  }
  async handleGoogleOAuth(token) {
    return await this.oauthService.handleGoogleOAuth(token);
  }
}

export default UserService;