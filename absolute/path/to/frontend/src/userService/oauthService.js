NEXT_PUBLIC_SUBGRAPH_USER_URL="http://localhost:4010/graphql"
// 从 config.js 直接导入 SUBGRAPH_USER_URL
import config, { SUBGRAPH_USER_URL } from '@/config/provider.js'

// 删除错误的定义
// Define the GraphQL endpoint URL
// const SUBGRAPH_USER_URL = `${config.API_URL}/graphql`;

class OAuthService {
    constructor() {
        this.token = null;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('jwt_token');
        }
    }
    async sendOAuthRequestToSubgraph(provider, token) {
        console.log("🔄 Sending request to subgraph...");

        try {
            console.log('Starting OAuth request...');
            const startTime = Date.now();
            
            // 直接使用导入的 SUBGRAPH_USER_URL
            const response = await fetch(SUBGRAPH_USER_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                mutation SignIn($input: SignInInput!) {
                  signIn(input: $input) {
                    success
                    userId
                    role
                    code
                  }
                }
              `,
                    variables: {
                        input: {
                            provider: provider.toUpperCase(),
                            token
                        }
                    }
                })
            });

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
        const endTime = Date.now();
        console.log(`OAuth request completed in ${endTime - startTime}ms`);
            console.log('OAuth response:', data);

            if (!data.data?.signIn?.success) {
          console.error('OAuth login failed:', data.errors?.[0]?.message);
                throw new Error(data.errors?.[0]?.message || 'OAuth login failed');
            }

            return { success: true, data: data.data.signIn };
        } catch (err) {
            console.error('OAuth request failed:', err);
            return { success: false };
        }
    }


    logout() {
        if (typeof window === 'undefined') return;

        // 清除本地存储的令牌
        localStorage.removeItem('jwt_token');
        this.token = null;

        // 可以在这里添加其他清理操作，如清除用户状态等
        console.log('User logged out');
    }

    /**
     * 注册新用户
     * @param {Object} userData - 用户注册数据
     * @returns {Promise<Object>} - 注册结果
     */
    async registerUser(userData) {
        try {
        console.log('Starting OAuth request...');
        const startTime = Date.now();
            // 如果没有提供头像，使用默认头像
            if (!userData.picture) {
                userData.picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
            }

            const query = `
               mutation Mutation($input: SignUpInput!) {
  signUp(input: $input) {
    role
    userId
    code
    message
    refreshToken
    success
    auth {
      token
    }
  }
}
            `;

            const response = await fetch(SUBGRAPH_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        input: userData
                    }
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
            }

            const registerResult = result.data.register;

            if (!registerResult.success) {
                throw new Error(registerResult.message || '注册失败');
            }

            // 存储JWT令牌
            if (registerResult.token) {
                localStorage.setItem('jwt_token', registerResult.token);
                this.token = registerResult.token;
            }

            return {
                success: true,
                user: registerResult.user,
                token: registerResult.token,
                message: registerResult.message
            };
        } catch (error) {
            console.error('注册失败:', error);
            return {
                success: false,
                error: error.message || '注册过程中发生错误'
            };
        }
    }

    getToken() {
        return this.token;
    }
}

// ✅ create and export a singleton instance
const oauthService = new OAuthService();
export default oauthService;