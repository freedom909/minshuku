//services/userService/index.js


import { GraphQLError } from 'graphql';

class UserService {
  constructor({ localAuthService = null, oauthService, tokenService, accountLockService = null }) {
    this.localAuthService = localAuthService;
    this.oauthService = oauthService;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
  }

  async oauthLogin(input) {
    return await this.oauthService.authenticate(input);
  }

  async login(input) {
    return await this.localAuthService.login(input);
  }
}

export default UserService;