// services/auth/oauth/providers/GithubProvider.js
import fetch from "node-fetch";

export default class GithubProvider {
  async verify(accessToken) {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await res.json();

    if (!profile?.id || !profile?.email) {
      throw new Error("Invalid GitHub token");
    }

    return {
      id: profile.id.toString(),
      email: profile.email,
      name: profile.name || profile.login,
      picture: profile.avatar_url,
    };
  }
}
