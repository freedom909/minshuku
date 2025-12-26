// services/auth/oauth/providers/github.provider.js
export default {
  async verify({ code }) {
    const githubUser = await verifyGithub(code);

    return {
      providerId: githubUser.id,
      email: githubUser.email,
      name: githubUser.login,
      avatar: githubUser.avatar_url,
    };
  },
};
