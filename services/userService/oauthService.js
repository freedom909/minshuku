import axios from 'axios';
import { RESTDataSource } from '@apollo/datasource-rest';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';

dotenv.config();  // Load environment variables

class OAuthService extends RESTDataSource {
    constructor({ tokenService, userRepository }) {
        super();
        if (!tokenService || !userRepository) {
            throw new Error("OAuthService requires tokenService and userRepository");
        }
        this.tokenService = tokenService;
        this.userRepository = userRepository;
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
            const jwtToken = this.tokenService.generateToken({ userId: user._id.toString() });

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
    async getUserInfo(provider, token) {
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
