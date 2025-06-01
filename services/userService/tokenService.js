//services/userService/tokenService.js
import jwt from 'jsonwebtoken';
const { sign, verify, decode } = jwt;

import { RESTDataSource } from '@apollo/datasource-rest';
import axios from 'axios';
import { GraphQLError } from 'graphql';
import dotenv from 'dotenv';
dotenv.config();


class TokenService extends RESTDataSource {
    constructor({ secretKey, expiresIn }) {
        if (!secretKey) {
            throw new GraphQLError('Secret key is required for token service', {
                extensions: { code: 'CONFIGURATION_ERROR' }
            });
        }
        super();
        this.secretKey = secretKey;
        this.expiresIn = expiresIn || '1h';
    }

    async getUserFromToken(token) {
        if (!token) {
            throw new GraphQLError('No token provided', {
                extensions: { code: 'AUTHENTICATION_ERROR' }
            });
        }

        try {
            // 验证并解码token
            const decoded = jwt.verify(token, this.secretKey);
            
            // 验证token的必要字段
            if (!decoded.userId || !decoded.email) {
                throw new GraphQLError('Invalid token format', {
                    extensions: { code: 'INVALID_TOKEN' }
                });
            }

            console.log('User extracted from token:', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            });

            return decoded;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new GraphQLError('Token has expired', {
                    extensions: { code: 'TOKEN_EXPIRED' }
                });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new GraphQLError('Invalid token', {
                    extensions: { code: 'INVALID_TOKEN' }
                });
            }
            throw new GraphQLError('Token verification failed', {
                extensions: { 
                    code: 'AUTHENTICATION_ERROR',
                    error: error.message
                }
            });
        }
    }

    async refreshToken(token) {
        if (!token) {
            throw new GraphQLError('No token provided', {
                extensions: { code: 'AUTHENTICATION_ERROR' }
            });
        }

        try {
            // 验证并解码token
            const decoded = jwt.verify(token, this.secretKey);
            
            // 验证token的必要字段
            if (!decoded.userId || !decoded.email) {
                throw new GraphQLError('Invalid token format', {
                    extensions: { code: 'INVALID_TOKEN' }
                });
            }

            console.log('User extracted from token:', {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            });

            // 生成新的token
            const newToken = await this.generateToken(decoded);

            console.log('New token generated:', {
                userId: decoded.userId,
                role: decoded.role
            });

            return newToken;
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new GraphQLError('Token has expired', {   
                    extensions: { code: 'TOKEN_EXPIRED' }
                });
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new GraphQLError('Invalid token', {
                    extensions: { code: 'INVALID_TOKEN' }
                });
            }
            throw new GraphQLError('Token refresh failed', {
                extensions: {
                    code: 'AUTHENTICATION_ERROR',
                    error: error.message
                }
            });
        }
    }

    async revokeProviderToken(provider, token) {
        if (!token) {
          throw new GraphQLError("No token provided", {
            extensions: { code: "AUTHENTICATION_ERROR" }
          });
        }
      
        try {
          switch (provider) {
            case "google":
              await axios.post(`https://oauth2.googleapis.com/revoke?token=${token}`);
              break;
      
            case "facebook":
              await axios.delete(`https://graph.facebook.com/me/permissions?access_token=${token}`);
              break;
      
            case "github":
              await axios.delete("https://api.github.com/applications/:client_id/token", {
                auth: {
                  username: process.env.GITHUB_CLIENT_ID,
                  password: process.env.GITHUB_CLIENT_SECRET,
                },
                data: { access_token: token },
              });
              break;
      
            default:
              throw new Error(`Unsupported provider: ${provider}`);
          }
        } catch (error) {
          throw new GraphQLError("Token revocation failed", {
            extensions: {
              code: "AUTHENTICATION_ERROR",
              error: error.message,
            },
          });
        }
      }
      

    async generateToken(user) {
        if (!user || !user._id) {
            throw new GraphQLError('Invalid user data for token generation', {
                extensions: { code: 'INVALID_INPUT' }
            });
        }

        try {
            const payload = {
                userId: typeof user._id === 'object' ? user._id.toString() : user._id,
                email: user.email,
                role: user.role || 'GUEST',
                type: 'ACCESS_TOKEN'
            };

            const token = sign(payload, this.secretKey, { 
                expiresIn: this.expiresIn,
                algorithm: 'HS256' // 明确指定算法
            });

            console.log('Generated token for user:', {
                userId: payload.userId,
                role: payload.role
            });

            return token;
        } catch (error) {
            console.error('Token generation error:', error);
            throw new GraphQLError('Failed to generate token', {
                extensions: { 
                    code: 'TOKEN_GENERATION_ERROR',
                    error: error.message
                }
            });
        }
    }

    async getToken(code, provider = 'GOOGLE') { 
        console.log(`Getting token for provider: ${provider} with code length: ${code?.length}`);
        
        if (!code) {
            throw new GraphQLError('Authorization code is required', {
                extensions: { code: 'INVALID_INPUT' }
            });
        }

        try {
            let tokenEndpoint, tokenParams;

            switch (provider.toUpperCase()) {
                case 'GOOGLE':
                    tokenEndpoint = 'https://oauth2.googleapis.com/token';
                    tokenParams = {
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                        grant_type: 'authorization_code',
                        code,
                        redirect_uri: process.env.GOOGLE_REDIRECT_URI
                    };
                    break;

                case 'FACEBOOK':
                    tokenEndpoint = 'https://graph.facebook.com/v12.0/oauth/access_token';
                    tokenParams = {
                        client_id: process.env.FB_APP_ID,
                        client_secret: process.env.FB_APP_SECRET,
                        code,
                        redirect_uri: process.env.FB_REDIRECT_URI
                    };
                    break;

                default:
                    throw new GraphQLError(`Unsupported OAuth provider: ${provider}`, {
                        extensions: { code: 'UNSUPPORTED_PROVIDER' }
                    });
            }

            console.log(`Requesting token from ${tokenEndpoint}`);
            
            const response = await axios({
                method: 'POST',
                url: tokenEndpoint,
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: new URLSearchParams(tokenParams)
            });

            const { access_token, id_token } = response.data;

            if (!access_token && !id_token) {
                throw new GraphQLError('No token received from provider', {
                    extensions: { 
                        code: 'TOKEN_RETRIEVAL_ERROR',
                        provider,
                        error: response.data.error_description || 'Unknown error'
                    }
                });
            }

            console.log(`Successfully retrieved token for provider: ${provider}`);
            return id_token || access_token;

        } catch (error) {
            console.error('Token retrieval error:', error);
            
            if (error instanceof GraphQLError) {
                throw error;
            }

            throw new GraphQLError('Failed to retrieve token from provider', {
                extensions: { 
                    code: 'TOKEN_RETRIEVAL_ERROR',
                    provider,
                    error: error.response?.data?.error_description || error.message
                }
            });
        }
    }

    async verifyToken(token) {
        if (!token) {
            throw new GraphQLError('No token provided for verification', {
                extensions: { code: 'INVALID_INPUT' }
            });
        }

        try {
            const decoded = verify(token, this.secretKey);
            
            // 验证token类型和必要字段
            if (!decoded.userId || !decoded.type) {
                throw new GraphQLError('Invalid token format', {
                    extensions: { code: 'INVALID_TOKEN' }
                });
            }

            return decoded;
        } catch (error) {
            console.error('Token verification error:', error);
            
            if (error instanceof jwt.TokenExpiredError) {
                throw new GraphQLError('Token has expired', {
                    extensions: { code: 'TOKEN_EXPIRED' }
                });
            }

            throw new GraphQLError('Invalid or expired token', {
                extensions: { 
                    code: 'INVALID_TOKEN',
                    error: error.message
                }
            });
        }
    }

    decodeToken(token) {
        if (!token) {
            return null;
        }

        try {
            // 使用 complete: true 获取完整的token信息，包括header
            const decoded = decode(token, { complete: true });
            
            if (!decoded) {
                console.warn('Token could not be decoded');
                return null;
            }

            return decoded;
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }

    // 用于验证token格式
    isValidTokenFormat(token) {
        return typeof token === 'string' 
            && token.split('.').length === 3 
            && token.trim().length > 0;
    }
    // 从HTTP请求头中提取token
    extractTokenFromRequest(req) {
        try {
            const authHeader = req.headers.authorization || '';
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return null;
            }
            
            const token = authHeader.replace('Bearer ', '');
            
            if (!this.isValidTokenFormat(token)) {
                return null;
            }
            
            return token;
        } catch (error) {
            console.error('Error extracting token from request:', error);
            return null;
        }
    }

    // 生成刷新token
    async generateRefreshToken(user) {
        if (!user || !user._id) {
            throw new GraphQLError('Invalid user data for refresh token generation', {
                extensions: { code: 'INVALID_INPUT' }
            });
        }

        try {
            const payload = {
                userId: typeof user._id === 'object' ? user._id.toString() : user._id,
                type: 'REFRESH_TOKEN'
            };

            return sign(payload, this.secretKey, { 
                expiresIn: '7d', // 刷新token有效期更长
                algorithm: 'HS256'
            });
        } catch (error) {
            console.error('Refresh token generation error:', error);
            throw new GraphQLError('Failed to generate refresh token', {
                extensions: { 
                    code: 'TOKEN_GENERATION_ERROR',
                    error: error.message
                }
            });
        }
    }

    // 使用刷新token生成新的访问token
    async refreshAccessToken(refreshToken) {
        try {
            // 验证刷新token
            const decoded = await this.verifyToken(refreshToken);
            
            // 确保是刷新token
            if (decoded.type !== 'REFRESH_TOKEN') {
                throw new GraphQLError('Invalid token type', {
                    extensions: { code: 'INVALID_TOKEN_TYPE' }
                });
            }
            
            // 创建新的访问token
            const payload = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role || 'GUEST',
                type: 'ACCESS_TOKEN'
            };
            
            return sign(payload, this.secretKey, { 
                expiresIn: this.expiresIn,
                algorithm: 'HS256'
            });
        } catch (error) {
            console.error('Token refresh error:', error);
            
            if (error instanceof GraphQLError) {
                throw error;
            }
            
            throw new GraphQLError('Failed to refresh access token', {
                extensions: { 
                    code: 'TOKEN_REFRESH_ERROR',
                    error: error.message
                }
            });
        }
    }
}

export default TokenService;