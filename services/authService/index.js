
// services/authService/index.js

class AuthService {
  constructor({ oauthLoginAdapter }) {
    this.oauthLoginAdapter = oauthLoginAdapter;
  }

  async oauthLogin(input) {
    const { provider, accessToken } = input;

    return this.oauthLoginAdapter.login({
      provider,
      accessToken,
    });
  }
}

export default AuthService;