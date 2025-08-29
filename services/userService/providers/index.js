// services/userService/providers/index.js
import axios from "axios";
import qs from "qs";
import { OAuth2Client } from "google-auth-library";

class GoogleOAuth {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async getProfile(idToken) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }

  async getProfile(accessToken) {
    if (!accessToken) throw new Error("Google accessToken missing");
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      console.error("GoogleOAuth getProfile error:", err.response?.data || err.message);
      throw new Error("Failed to fetch Google user profile");
    }
  }
}

class FacebookOAuth {
  constructor() {
    this.clientId = process.env.FACEBOOK_CLIENT_ID;
    this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error("Facebook OAuth environment variables missing");
    }
  }

//   async getTokens(code) {
//     if (!code) throw new Error("Facebook OAuth code missing");

//     const params = {
//       code,
//       client_id: this.clientId,
//       client_secret: this.clientSecret,
//       redirect_uri: this.redirectUri,
//     };

//     try {
//       const res = await axios.get("https://graph.facebook.com/v18.0/oauth/access_token", { params });
//       if (!res.data.access_token) throw new Error("No access_token returned from Facebook");
//       return res.data;
//     } catch (err) {
//       console.error("FacebookOAuth getTokens error:", err.response?.data || err.message);
//       throw new Error("Failed to exchange Facebook code for tokens");
//     }
//   }

  async getProfile(accessToken) {
    if (!accessToken) throw new Error("Facebook accessToken missing");

    try {
      const res = await axios.get("https://graph.facebook.com/me", {
        params: { fields: "id,name,email,picture", access_token: accessToken },
      });
      return res.data;
    } catch (err) {
      console.error("FacebookOAuth getProfile error:", err.response?.data || err.message);
      throw new Error("Failed to fetch Facebook user profile");
    }
  }
}

// class AppleOAuth {
//   constructor() {
//     this.clientId = process.env.APPLE_CLIENT_ID;
//     this.clientSecret = process.env.APPLE_CLIENT_SECRET;
//     this.redirectUri = process.env.APPLE_REDIRECT_URI;

//     if (!this.clientId || !this.clientSecret || !this.redirectUri) {
//       throw new Error("Apple OAuth environment variables missing");
//     }
//   }

//   async getTokens(code) {
//     if (!code) throw new Error("Apple OAuth code missing");

//     const body = qs.stringify({
//       code,
//       client_id: this.clientId,
//       client_secret: this.clientSecret,
//       redirect_uri: this.redirectUri,
//       grant_type: "authorization_code",
//     });

//     try {
//       const res = await axios.post("https://appleid.apple.com/auth/token", body, {
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       });
//       if (!res.data.access_token && !res.data.id_token)
//         throw new Error("No access_token/id_token returned from Apple");
//       return res.data;
//     } catch (err) {
//       console.error("AppleOAuth getTokens error:", err.response?.data || err.message);
//       throw new Error("Failed to exchange Apple code for tokens");
//     }
//   }

//   async getProfile(tokens) {
//     // Apple returns user info in id_token
//     const idToken = tokens.id_token;
//     if (!idToken) throw new Error("Apple id_token missing");

//     try {
//       const decoded = jwt.decode(idToken);
//       return decoded; // contains sub, email, name (if requested)
//     } catch (err) {
//       console.error("AppleOAuth getProfile error:", err.message);
//       throw new Error("Failed to decode Apple id_token");
//     }
//   }
// }

class GithubOAuth {
  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error("Github OAuth environment variables missing");
    }
  }

//   async getTokens(code) {
//     if (!code) throw new Error("Github OAuth code missing");

//     const body = qs.stringify({
//       code,
//       client_id: this.clientId,
//       client_secret: this.clientSecret,
//       redirect_uri: this.redirectUri,
//     });

//     try {
//       const res = await axios.post("https://github.com/login/oauth/access_token", body, {
//         headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
//       });
//       if (!res.data.access_token) throw new Error("No access_token returned from Github");
//       return res.data;
//     } catch (err) {
//       console.error("GithubOAuth getTokens error:", err.response?.data || err.message);
//       throw new Error("Failed to exchange Github code for tokens");
//     }
//   }

  async getProfile(accessToken) {
    if (!accessToken) throw new Error("Github accessToken missing");

    try {
      const res = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.data;
    } catch (err) {
      console.error("GithubOAuth getProfile error:", err.response?.data || err.message);
      throw new Error("Failed to fetch Github user profile");
    }
  }
}

export { GoogleOAuth, FacebookOAuth, GithubOAuth };
