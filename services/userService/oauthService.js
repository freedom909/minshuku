import axios from 'axios';
import { RESTDataSource } from '@apollo/datasource-rest';
import dotenv from 'dotenv';
import { GraphQLError } from 'graphql';
import { OAuth2Client } from 'google-auth-library';
// Since 'getUserByEmailFromDb' is declared but not used, remove the import statement.
import getUserByEmailFromDb from '../repositories/userRepository.js'; // Import the function from userRepository.js
dotenv.config();


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const PROVIDERS = {
    GOOGLE: {
        decode: async (token) => {
            console.log('开始验证 Google 令牌:', token); // 添加日志
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                console.log('Google 令牌验证成功:', ticket.getPayload()); // 添加日志
                return ticket.getPayload();
            } catch (error) {
                console.error('Google 令牌验证失败:', error); // 添加错误日志
                throw error;
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
        decode: async (token) => { /* your apple decode logic */ },
        validateUrl: (token) => `https://appleid.apple.com/auth/tokeninfo?id_token=${token}`,
        validateCheck: (data) => data.aud === process.env.APPLE_CLIENT_ID,
        revokeUrl: (token) => `https://appleid.apple.com/auth/revoke`,
        userInfo: {
            url: 'https://appleid.apple.com/auth/userinfo',
            needsAuthHeader: true,
        }
    }
    
    // 🔥 Add more providers here easily later...
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
        if (!provider || !token) {
            console.error("❌ Missing provider or token");
            throw new Error("Missing provider token for OAuth login");
        }
        try {
            const userInfo = await this.verifyOAuthToken(provider, token);
            console.log("✅ OAuth token verified. User info:", userInfo);
            return userInfo;
        } catch (error) {
            console.error("⚠️ Error verifying OAuth token:", error);
            throw new Error("Invalid OAuth token");
        }
    }

    async verifyOAuthToken(provider, token) {
        const config = this.getProviderConfig(provider);
        return config.decode(token);
    }

    async validateProviderToken(provider, token) {
        const config = this.getProviderConfig(provider);
        const url = config.validateUrl(token);

        try {
            const { data } = await axios.get(url);
            return config.validateCheck(data);
        } catch (error) {
            console.error(`❌ Error validating token for ${provider}:`, error.message);
            throw new Error("Failed to validate provider token");
        }
    }


    async refreshProviderToken(provider, refreshToken) {
        const config = this.getProviderConfig(provider);
        const { client_id, client_secret } = config;
        const tokenUrl = config.tokenUrl;

        try {
            const { data } = await axios.post(tokenUrl, {
                client_id,
                client_secret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        }catch (error) {
            console.error(`❌ Error refreshing token for ${provider}:`, error.message);
            throw new Error("Failed to refresh provider token");
        }
    }
    async revokeProviderToken(provider, context) {
        const config = this.getProviderConfig(provider);
        const { token } = context;
        if (!token) {
            console.warn('⚠️ No OAuth token found in context, skipping revocation.');
            return;
        }

        try {
            const revokeUrl = config.revokeUrl(token);
            await axios.post(revokeUrl);
            console.log(`✅ Revoked token for ${provider}`);
        } catch (error) {
            console.error(`❌ Error revoking token for ${provider}:`, error.message);
            throw new GraphQLError(`Failed to revoke ${provider} token`, { extensions: { code: 'TOKEN_REVOCATION_FAILED' } });
        }
    }

    async saveOAuthUser({ provider, token, email, name, picture, role = "GUEST" }) {
        if (!provider || !token || !email || !name) {
            throw new Error("Missing required OAuth user fields");
        }
    
        try {
            const existingUser = await this.userRepository.getUserByEmailFromDb(email);
            if (existingUser) {
                console.log(`✅ User already exists: ${email}`);
                return existingUser;
            }
    
            const newUser = await this.userRepository.insertUser({
                email,
                name,
                picture,
                provider,
                role,
            });
    
            if (!newUser) {
                throw new Error("User creation failed");
            }
    
            console.log(`✅ Created new user: ${email}`);
            return newUser;
        } catch (error) {
            console.error("❌ Error saving OAuth user:", error);
            throw new Error("Failed to save OAuth user");
        }
    }
    
    async insertUser({ email, name, picture, provider, role }) {
        return await UserModel.create({ email, name, picture, provider, role });
      }
      

    async getUserInfoFromProvider(provider, token) {
        const config = this.getProviderConfig(provider);

        try {
            if (config.userInfo.needsAuthHeader) {
                const { data } = await axios.get(config.userInfo.url, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                return data;
            } else {
                const url = typeof config.userInfo.url === 'function'
                    ? config.userInfo.url(token)
                    : config.userInfo.url;
                const { data } = await axios.get(url);
                return data;
            }
        } catch (error) {
            console.error(`❌ Error fetching user info from ${provider}:`, error.message);
            throw new Error('Failed to retrieve user information');
        }
    }

    async loginWithProvider(providerUserInfo) {
        try {
            console.log('尝试通过提供商登录，用户信息:', providerUserInfo);
            const email=providerUserInfo.email;
            let user = await this.userRepository.getUserByEmailFromDb(email);
            if (!user) {
                console.log('用户不存在，创建新用户:', providerUserInfo);
                user = await this.userRepository.save({
                    email: providerUserInfo.email,
                    name: providerUserInfo.name,
                    provider: providerUserInfo.provider || "OAUTH",
                    picture: providerUserInfo.picture?.data?.url || providerUserInfo.picture,
                    role: "GUEST",
                });
            }

            const jwtToken = this.tokenService.generateToken(user);
            console.log('成功生成 JWT 令牌:', jwtToken);
            return { token: jwtToken, user };
        } catch (error) {
            console.error('❌ Error in loginWithProvider:', error.message);
            console.error('错误堆栈:', error.stack);
            throw new Error("Failed to log in with the specified provider");
        }
    }
}

export default OAuthService;
