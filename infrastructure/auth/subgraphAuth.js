import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { authenticate } from './authenticateAndAuthorize.js';

/**
 * Subgraph Authentication Service
 * Handles authentication and authorization for federated GraphQL subgraphs
 */
class SubgraphAuthService {
  constructor(config = {}) {
    this.JWT_SECRET = process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string';

    this.TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';
    this.ALLOWED_SERVICES = new Set(config.allowedServices || []);
  }

  /**
   * Validates the authentication token and extracts user information
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {AuthenticationError} If token is invalid
   */
  validateToken(token) {
    try {
      if (!token) {
        throw new AuthenticationError('No token provided');
      }

      const decoded = jwt.verify(token, this.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Invalid token');
    }
  }

  /**
   * Creates a service-to-service token for inter-subgraph communication
   * @param {string} serviceId - Identifier of the requesting service
   * @returns {string} JWT token for service-to-service communication
   */
  createServiceToken(serviceId) {
    if (!this.ALLOWED_SERVICES.has(serviceId)) {
      throw new ForbiddenError('Service not authorized');
    }

    return jwt.sign(
      {
        serviceId,
        type: 'service',
      },
      this.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  /**
   * Middleware for authenticating requests in subgraphs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware function
   */
  subgraphAuthMiddleware = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      console.log("AUTH HEADER:", req.headers.authorization);

      // Check for service-to-service communication
      if (req.headers['x-service-token']) {
        const serviceToken = this.validateToken(req.headers['x-service-token']);
        if (serviceToken.type === 'service') {
          req.service = serviceToken;
          return next();
        }
      }

      // Regular user authentication
      if (token) {
        const decoded = this.validateToken(token);
        req.user = decoded;
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Creates context for GraphQL resolvers with auth information
   * @param {Object} req - Express request object
   * @returns {Object} Context object with auth information
   */
  createContext = ({ req }) => {
    return {
      user: req.user,
      service: req.service,
      auth: {
        isAuthenticated: !!req.user,
        isService: !!req.service,
      },
    };
  };

  /**
   * Directive for protecting fields and types in the schema
   * @param {Object} directiveArgs - Arguments passed to the directive
   * @returns {Function} Directive transformer
   */
  authDirective = (directiveArgs = {}) => {
    const { requires } = directiveArgs;

    return {
      // Field level protection
      fieldVisitor: (field) => {
        const { resolve = defaultFieldResolver } = field;
        
        field.resolve = async (source, args, context, info) => {
          await this.validateAccess(context, requires);
          return resolve(source, args, context, info);
        };
      },
      
      // Type level protection
      typeVisitor: (type) => {
        const fields = type.getFields();
        
        Object.values(fields).forEach((field) => {
          const { resolve = defaultFieldResolver } = field;
          
          field.resolve = async (source, args, context, info) => {
            await this.validateAccess(context, requires);
            return resolve(source, args, context, info);
          };
        });
      },
    };
  };

  /**
   * Validates access based on requirements
   * @param {Object} context - GraphQL context
   * @param {Object} requires - Access requirements
   * @throws {ForbiddenError} If access requirements are not met
   */
  async validateAccess(context, requires = {}) {
    const { user, service, auth } = context;

    // Allow service-to-service communication
    if (auth.isService) {
      return true;
    }

    // Check authentication requirement
    if (requires.auth && !auth.isAuthenticated) {
      throw new AuthenticationError('Authentication required');
    }

    // Check role requirement
    if (requires.role && (!user || user.role !== requires.role)) {
      throw new ForbiddenError(`Role ${requires.role} required`);
    }

    // Check permission requirement
    if (requires.permission && (!user || !user.permissions?.includes(requires.permission))) {
      throw new ForbiddenError(`Permission ${requires.permission} required`);
    }

    return true;
  }
}

// Example usage in a subgraph
const createSubgraphServer = (typeDefs, resolvers, config = {}) => {
  const authService = new SubgraphAuthService(config);

  return new ApolloServer({
    typeDefs,
    resolvers,
    context: authService.createContext,
    plugins: [
      {
        requestDidStart: async ({ request, context }) => {
          // Log subgraph access
          console.log(`Subgraph access: ${request.operationName}`);
          
          return {
            willSendResponse: async ({ response }) => {
              // Add auth headers to response if needed
              if (context.service) {
                response.http.headers.set(
                  'x-service-token',
                  authService.createServiceToken(context.service.serviceId)
                );
              }
            },
          };
        },
      },
    ],
  });
};

export { SubgraphAuthService, createSubgraphServer };