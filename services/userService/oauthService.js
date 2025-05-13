//services/usserService/oauthService.js
import axios from 'axios';
import { RESTDataSource } from '@apollo/datasource-rest';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library';
dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PROVIDERS = {
    GOOGLE: {
        decode: async (token) => {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                return ticket.getPayload();
            } catch (error) {
                throw new Error('Invalid Google token');
            }
        },
        validateUrl: (token) => `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
        validateCheck: (data) => data.aud === process.env.GOOGLE_CLIENT_ID,
        revokeUrl: (token) => `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
        userInfo: {
            url: 'https://www.googleapis.com/oauth2/v3/userinfo',
            needsAuthHeader: true,
        }
    },
    FACEBOOK: {
        decode: async (token) => {
            const { data } = await axios.get('https://graph.facebook.com/me', {
                params: { fields: 'id,name,email,picture', access_token: token },
            });
            return data;
        },
        validateUrl: (token) => `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FACEBOOK_APP_TOKEN}`,
        validateCheck: (data) => data.data?.is_valid,
        revokeUrl: (token) => `https://graph.facebook.com/me/permissions?access_token=${token}`,
        userInfo: {
            url: (token) => `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`,
            needsAuthHeader: false,
        }
    },
    APPLE: {
        decode: async (token) => { /* TODO: implement Apple decode */ },
        validateUrl: (token) => `https://appleid.apple.com/auth/tokeninfo?id_token=${token}`,
        validateCheck: (data) => data.aud === process.env.APPLE_CLIENT_ID,
        revokeUrl: (token) => `https://appleid.apple.com/auth/revoke`,
        userInfo: {
            url: 'https://appleid.apple.com/auth/userinfo',
            needsAuthHeader: true,
        }
    }
};

class OAuthService extends RESTDataSource {
    constructor({ tokenService, userRepository }) {
        super();
        if (!tokenService || !userRepository) {
            throw new Error("OAuthService requires tokenService and userRepository");
        }
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    normalizeProvider(provider) {
        return provider?.toUpperCase();
    }

    getProviderConfig(provider) {
        const config = PROVIDERS[this.normalizeProvider(provider)];
        if (!config) {
            throw new Error(`Unsupported OAuth provider: ${provider}`);
        }
        return config;
    }

    async authenticate(provider, token) {
        if (!provider || !token) throw new Error("Missing provider or token");
        try {
            const userInfo = await this.verifyOAuthToken(provider, token);
            const user = await this.saveOAuthUser({
                provider,
                token,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
            });
            return user;
        } catch (error) {
            throw new Error("Invalid OAuth token");
        }
    }

    async verifyOAuthToken(provider, token) {
        const config = this.getProviderConfig(provider);
        return config.decode(token);
    }

    async saveOAuthUser({ provider, token, email, name, picture, role = "GUEST" }) {
        if (!email || !name) throw new Error("Missing required fields");

        const existingUser = await this.userRepository.getUserByEmailFromDb(email);
        if (existingUser) return existingUser;

        return await this.userRepository.insertUser({
            email,
            name,
            picture,
            provider,
            role,
        });
    }

    async getUserInfoFromProvider(provider, token) {
        const config = this.getProviderConfig(provider);
        const url = typeof config.userInfo.url === 'function' ? config.userInfo.url(token) : config.userInfo.url;

        try {
            const headers = config.userInfo.needsAuthHeader
                ? { Authorization: `Bearer ${token}` }
                : {};
            const { data } = await axios.get(url, { headers });
            return data;
        } catch {
            throw new Error('Failed to retrieve user information');
        }
    }

    async validateProviderToken(provider, token) {
        switch (provider.toLowerCase()) {
            case 'google': return this.validateGoogleToken(token);
            case 'facebook': return this.validateFacebookToken(token);
            default: throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    async validateGoogleToken(token) {
        try {
            const { data } = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            return !!data.aud;
        } catch {
            return false;
        }
    }

    async validateFacebookToken(token) {
        try {
            const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
            const { data } = await axios.get(url);
            return data.data?.is_valid;
        } catch {
            return false;
        }
    }

    async revokeProviderToken(provider, context) {
        const config = this.getProviderConfig(provider);
        const { token } = context;
        if (!token) return;

        try {
            await axios.post(config.revokeUrl(token));
        } catch (error) {
            throw new GraphQLError(`Failed to revoke ${provider} token`, {
                extensions: { code: 'TOKEN_REVOCATION_FAILED' },
            });
        }
    }

    async loginWithProvider(providerUserInfo) {
        try {
            const email = providerUserInfo.email;
            let user = await this.userRepository.getUserByEmailFromDb(email);

            if (!user) {
                user = await this.userRepository.save({
                    email,
                    name: providerUserInfo.name,
                    provider: providerUserInfo.provider || "OAUTH",
                    picture: providerUserInfo.picture?.data?.url || providerUserInfo.picture,
                    role: "GUEST",
                });
            }

            const token = this.tokenService.generateToken(user);
            return { token, user };
        } catch (error) {
            throw new Error("Failed to log in with the specified provider");
        }
    }
}

export default OAuthService;

