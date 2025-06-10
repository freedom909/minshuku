import GraphQLError from 'graphql';
import jwt from 'jsonwebtoken';
async function getUserFromToken(token) {
    if (!token) {
        throw new GraphQLError('No token provided', {
            extensions: { code: 'AUTHENTICATION_ERROR' }
        });
    }

    try {
        // 验证并解码token
        const decoded = jwt.verify(token, this.secretKey, { clockTolerance: 300 });
        
        // 验证token的必要字段
        if (!decoded.userId || !decoded.email) {
            throw new GraphQLError('Invalid token format', {
                extensions: { code: 'INVALID_TOKEN' }
            });
        }

        logger.info('User extracted from token:', {
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
export default getUserFromToken;