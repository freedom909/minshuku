// src/userService/oauthService.js

const config = {
    google: {
        clientId: 'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID',
        clientSecret: 'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
        redirectUri: 'http://localhost:3000/auth/callback'
    },
    facebook: {
        clientId: 'your-facebook-app-id',
        clientSecret: 'your-facebook-app-secret',
        redirectUri: 'http://localhost:3000/auth/callback'
    }
};

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
    async loginWithProvider(provider, token) {
        const isValid = await this.validateProviderToken(provider, token);
        if (!isValid) {
            throw new Error('Invalid OAuth token');
        }

        const userInfo = await this.getUserInfoFromProvider(provider, token);
        console.log(`Logging in with ${provider} using user info:`, userInfo);

        return {
            success: true,
            user: userInfo,
            token: 'mock-jwt-token'
        };
    }

    /**
     * 向 subgraph-users 发送 OAuth 登录请求
     * @param {string} provider - 提供商名称
     * @param {string} token - OAuth 令牌
     * @returns {Promise<Object>} - 服务器响应
     */
    async sendOAuthRequestToSubgraph(provider, token) {
        const SUBGRAPH_USERS_URL = 'http://localhost:4010/oauthLogin'; // Adjust if needed

        try {
            const response = await fetch(SUBGRAPH_USERS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ provider, token })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending request to subgraph-users:', error);
            throw error;
        }
    }
}

export default OAuthService;
