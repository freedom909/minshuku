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
     * 检查令牌基本格式是否有效
     * @param {string} provider - 提供商名称，如 'google', 'facebook' 等
     * @param {string} token - OAuth 令牌
     * @returns {boolean} - 令牌格式是否有效
     */
    validateTokenFormat(provider, token) {
        if (!token) {
            console.error(`No token provided for ${provider}`);
            return false;
        }
        
        // 简单的格式检查，实际验证将在后端进行
        if (provider === 'google' && token.startsWith('ya29.')) {
            return true;
        } else if (provider === 'facebook' && token.length > 20) {
            return true;
        } else if (provider === 'github' && token.length > 20) {
            return true;
        } else if (!['google', 'facebook', 'github'].includes(provider)) {
            console.error(`Unsupported provider: ${provider}`);
            return false;
        }
        
        return true;
    }

    /**
     * 检查用户是否已登录
     * @returns {boolean} - 用户是否已登录
     */
    isLoggedIn() {
        const token = this.getToken();
        return !!token;
    }
    
    /**
     * 获取存储的JWT令牌
     * @returns {string|null} - JWT令牌或null
     */
    getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('jwt_token');
    }
    
    /**
     * 获取当前用户信息
     * @returns {Promise<Object>} - 用户信息
     */
    async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;
        
        try {
            const query = `
                query Me {
                    me {
                        id
                        email
                        name
                        profilePicture
                        role
                    }
                }
            `;
            
            const response = await fetch(SUBGRAPH_AUTH_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                this.logout();
                return null;
            }
            
            return result.data.me;
        } catch (error) {
            console.error('Failed to get current user:', error);
            this.logout();
            return null;
        }
    }

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
            
            // 验证令牌格式
            if (!this.validateTokenFormat(provider, token)) {
                throw new Error(`Invalid ${provider} token format`);
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

    /**
     * 登出用户
     * @returns {void}
     */
    logout() {
        if (typeof window === 'undefined') return;
        
        // 清除本地存储的令牌
        localStorage.removeItem('jwt_token');
        
        // 可以在这里添加其他清理操作，如清除用户状态等
        console.log('User logged out');
    }
}

// Create and export the singleton instance
export const oauthService = new OAuthService();