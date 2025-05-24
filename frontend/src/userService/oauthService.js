// src/userService/oauthService.js

const config = {
    google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    },
    facebook: {
        clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    },
    github: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    }
};

// Define the GraphQL endpoint URL
const SUBGRAPH_AUTH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL || 'http://localhost:4010/graphql';
console.log('SUBGRAPH_AUTH_URL:', SUBGRAPH_AUTH_URL);

class OAuthService {
    constructor(configOverrides = {}) {
        this.config = { ...config, ...configOverrides };
    }

    /**
     * 验证提供商令牌
     * @param {string} provider - 提供商名称，如 'google', 'facebook' 等
     * @param {string} token - OAuth 令牌
     * @returns {Promise<boolean>} - 令牌是否有效
     */
    async validateProviderToken(provider, token) {
        console.log(`Validating ${provider} token: ${token}`);
         // TODO: Add actual validation logic using provider APIs
         if (!token) {
            console.error(`No token provided for ${provider}`);
            return false;
         }
         if (provider === 'google') {
            // Example validation for Google (replace with actual logic)
            if (!token.includes('google')) {
                console.error(`Invalid Google token: ${token}`);
                return false;
            }
         }
         // Add similar validation for other providers
         else if (provider === 'facebook') {
            // Validate Facebook token
            if (!token.includes('facebook')) {
                console.error(`Invalid Facebook token: ${token}`);
                return false;
            }
         }
         else if (provider === 'github') {
            // Validate GitHub token
            try {
                // In a real implementation, you would verify the token with GitHub API
                // For example: https://api.github.com/user with Authorization header
                if (!token) {
                    console.error('Invalid GitHub token');
                    return false;
                }
                return true;
            } catch (error) {
                console.error('GitHub token validation error:', error);
                return false;
            }
         }
         else {
            console.error(`Unsupported provider: ${provider}`);
            return false;
         }
        return true;
    }

    /**
     * 从提供商获取用户信息
     * @param {string} provider - 提供商名称
     * @param {string} token - OAuth 令牌
     * @returns {Promise<Object>} - 用户信息
     */
    async getUserInfoFromProvider(provider, token) {
        console.log(`Getting user info from ${provider} with token: ${token}`);
        // TODO: Replace this with real API call
        return {
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://example.com/avatar.jpg',
            oauthId: `${provider}-mock-oauth-id`
        };
    }

    /**
     * 使用提供商登录
     * @param {string} provider - 提供商名称
     * @param {string} token - OAuth 令牌
     * @returns {Promise<Object>} - 登录结果
     */
    /**
     * 使用提供商登录
     * @param {string} provider - 提供商名称
     * @param {string} token - OAuth 令牌
     * @returns {Promise<Object>} - 登录结果
     */
    async loginWithProvider(provider, token) {
        try {
            console.log(`Attempting to login with ${provider}...`);
            console.log('Auth URL:', SUBGRAPH_AUTH_URL);
            
            // Validate the token first
            const isValid = await this.validateProviderToken(provider, token);
            if (!isValid) {
                throw new Error(`Invalid ${provider} token`);
            }

            const query = `
                mutation SignIn($provider: String!, $token: String!) {
                    signIn(input: { provider: $provider, token: $token }) {
                        success
                        token
                        user {
                            id
                            email
                            name
                        }
                        error
                    }
                }
            `;

            const response = await fetch(SUBGRAPH_AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        provider,
                        token
                    }
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Auth response structure:', Object.keys(result));
            
            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
            }

            const authResult = result.data.signIn;
            
            if (!authResult.success) {
                throw new Error(authResult.error || 'Authentication failed');
            }

            // Store the JWT token
            if (authResult.token) {
                console.log('Storing JWT token...');
                localStorage.setItem('jwt_token', authResult.token);
            }

            return {
                success: true,
                user: authResult.user,
                token: authResult.token
            };
        } catch (error) {
            console.error(`${provider} login failed:`, error);
            return {
                success: false,
                error: error.message || `Failed to login with ${provider}`
            };
        }
    }
}

// Create and export the singleton instance
export const oauthService = new OAuthService();