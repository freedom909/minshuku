//services/userService/index.js


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
    return await this.localAuthService.login(email, password);
  }
}

export default UserService;