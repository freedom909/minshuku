import axios from 'axios';
import { RESTDataSource } from '@apollo/datasource-rest';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();  // Load environment variables
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
class OAuthService extends RESTDataSource {
    constructor({ tokenService, userRepository }) {
        super();
        if (!tokenService || !userRepository) {
            throw new Error("OAuthService requires tokenService and userRepository");
        }
        this.tokenService = tokenService;
        this.userRepository = userRepository;
    }

    async authenticate(provider, token) {
        console.log("🔍 OAuthService.authenticate called with:");
        console.log("➡️ Provider:", provider);
        console.log("➡️ Token:", token ? token.slice(0, 20) + "..." : "No Token Received"); // Shorten token for readability

        if (!provider || !token) {
            console.error("❌ Missing provider or token");
            throw new Error("Missing provider token for OAuth login");
        }

        try {
            const userInfo = await this.verifyOAuthToken(provider, token);
            console.log('this:', this)
            console.log("✅ OAuth token verified. User info:", userInfo);
            return userInfo;
        } catch (error) {
            console.error("⚠️ Error verifying OAuth token:", error);
            throw new Error("Invalid OAuth token");
        }
    }

    async verifyOAuthToken(provider, token) {
        console.log("🔎 Verifying token for provider:", provider);

        // Example token verification logic (modify based on actual implementation)
        if (provider === "GOOGLE") {
            try {
                const decoded = await this.decodeGoogleToken(token);
                console.log("✅ Decoded Google token:", decoded);
                return decoded;
            } catch (err) {
                console.error("❌ Error decoding Google token:", err);
                throw new Error("Failed to decode Google token");
            }
        }

        console.error("❌ Unsupported provider:", provider);
        throw new Error("OAuth provider not supported");
    }

    async decodeGoogleToken(token) {
        try {
            console.log("🔍 Decoding Google token with google-auth-library...");
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID, // Must match the client ID of your Google App
            });

            const payload = ticket.getPayload();
            console.log("✅ Google token decoded:", payload);
            return payload; // Contains user info like email, name, picture, etc.
        } catch (error) {
            console.error("❌ Error decoding Google token:", error.message);
            throw new Error("Invalid Google token");
        }
    }
    /**
     * Logs in a user via OAuth provider.
     */
    async loginWithProvider({ provider, token }) {
        try {
            const userInfo = await this.getUserInfo(provider, token);

            let user = await this.userRepository.getUserByEmailFromDb(userInfo.email);
            if (!user) {
                user = await this.userRepository.save({
                    email: userInfo.email,
                    name: userInfo.name,
                    provider,
                    picture: userInfo.picture,
                });
            }

            // Generate JWT token
            const jwtToken = this.tokenService.generateToken(user);

            return { token: jwtToken, user };
        } catch (error) {
            console.error('Error in loginWithProvider:', error.message);
            throw new Error("Failed to log in with the specified provider");
        }
    }

    /**
     * Revokes an OAuth provider token.
     */
    async revokeProviderToken(provider, context) {
        const { token } = context;
        if (!token) {
            console.warn('No OAuth token found in context, skipping revocation.');
            return;
        }

        const revokeUrls = {
            google: `https://accounts.google.com/o/oauth2/revoke?token=${token}`,
            facebook: `https://graph.facebook.com/me/permissions?access_token=${token}`
        };

        const revokeUrl = revokeUrls[provider];
        if (!revokeUrl) {
            console.warn(`OAuth provider ${provider} not supported for logout.`);
            return;
        }

        try {
            await axios.post(revokeUrl);
            console.log(`Revoked token for ${provider}`);
        } catch (error) {
            console.error(`Error revoking token for ${provider}:`, error.message);
            throw new GraphQLError(`Failed to revoke ${provider} token`, { extensions: { code: 'TOKEN_REVOCATION_FAILED' } });
        }
    }

    /**
     * Validates an OAuth token.
     */
    async validateProviderToken(provider, token) {
        if (!token) {
            throw new GraphQLError(`Provider token is required for ${provider} login`, {
                extensions: { code: 'PROVIDER_TOKEN_REQUIRED' },
            });
        }

        const validationUrls = {
            google: `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
            facebook: `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FACEBOOK_APP_TOKEN}`
        };

        const url = validationUrls[provider];
        if (!url) {
            throw new Error(`Unsupported OAuth provider: ${provider}`);
        }

        try {
            const { data } = await axios.get(url);
            return provider === 'google' ? data.aud === process.env.GOOGLE_CLIENT_ID : data.data.is_valid;
        } catch (error) {
            console.error(`Error validating token for provider ${provider}:`, error.message);
            throw new Error("Failed to validate provider token");
        }
    }

    /**
     * Fetches user information from an OAuth provider.
     */
    async getUserInfoFromProvider(provider, token) {

        const endpoints = {
            google: { url: 'https://www.googleapis.com/oauth2/v3/userinfo', tokenType: 'Bearer' },
            facebook: { url: `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`, tokenType: '' }
        };

        const providerInfo = endpoints[provider];
        if (!providerInfo) {
            throw new Error('Unsupported OAuth provider');
        }

        try {
            const { data } = await axios.get(providerInfo.url, providerInfo.tokenType ? {
                headers: { Authorization: `${providerInfo.tokenType} ${token}` }
            } : {});

            return data;
        } catch (error) {
            console.error(`Error fetching user info from ${provider}:`, error.message);
            throw new Error('Failed to retrieve user information');
        }
    }
}

export default OAuthService;
