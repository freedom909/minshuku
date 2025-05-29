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
    return await this.oauthService.authenticate(provider, token);
  }

  async login(email, password) {
    const response = await this.localAuthService.login(email, password);
    return await validateLoginResponse(response);
  }

}

export default UserService;