import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { SubgraphAuthService } from './subgraphAuth.js';

describe('SubgraphAuthService', () => {
  const TEST_JWT_SECRET = 'minshuku_jwt_secret_key_2024_secure_random_string';
  const TEST_CONFIG = {
    jwtSecret: TEST_JWT_SECRET,
    allowedServices: ['service1', 'service2'],
  };

  let authService;

  beforeEach(() => {
    authService = new SubgraphAuthService(TEST_CONFIG);
  });

  describe('Token Validation', () => {
    it('should validate a valid token', () => {
      const payload = { userId: '123', role: 'USER' };
      const token = jwt.sign(payload, TEST_JWT_SECRET);

      const decoded = authService.validateToken(token);
      expect(decoded).toMatchObject(payload);
    });

    it('should throw on invalid token', () => {
      expect(() => {
        authService.validateToken('invalid-token');
      }).toThrow(AuthenticationError);
    });

    it('should throw when no token provided', () => {
      expect(() => {
        authService.validateToken(null);
      }).toThrow(AuthenticationError);
    });
  });

  describe('Service Token Creation', () => {
    it('should create valid service token for allowed service', () => {
      const serviceId = 'service1';
      const token = authService.createServiceToken(serviceId);

      const decoded = jwt.verify(token, TEST_JWT_SECRET);
      expect(decoded).toMatchObject({
        serviceId,
        type: 'service',
      });
    });

    it('should throw for unauthorized service', () => {
      expect(() => {
        authService.createServiceToken('unauthorized-service');
      }).toThrow(ForbiddenError);
    });
  });

  describe('Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      mockRes = {};
      mockNext = jest.fn();
    });

    it('should process user token', async () => {
      const payload = { userId: '123', role: 'USER' };
      const token = jwt.sign(payload, TEST_JWT_SECRET);
      mockReq.headers.authorization = `Bearer ${token}`;

      await authService.subgraphAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toMatchObject(payload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should process service token', async () => {
      const serviceToken = authService.createServiceToken('service1');
      mockReq.headers['x-service-token'] = serviceToken;

      await authService.subgraphAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.service).toBeDefined();
      expect(mockReq.service.type).toBe('service');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing tokens', async () => {
      await authService.subgraphAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.user).toBeUndefined();
      expect(mockReq.service).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle invalid tokens', async () => {
      mockReq.headers.authorization = 'Bearer invalid-token';

      await authService.subgraphAuthMiddleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AuthenticationError));
    });
  });

  describe('Context Creation', () => {
    it('should create context with user auth', () => {
      const req = {
        user: { userId: '123', role: 'USER' },
      };

      const context = authService.createContext({ req });

      expect(context).toEqual({
        user: req.user,
        service: undefined,
        auth: {
          isAuthenticated: true,
          isService: false,
        },
      });
    });

    it('should create context with service auth', () => {
      const req = {
        service: { serviceId: 'service1', type: 'service' },
      };

      const context = authService.createContext({ req });

      expect(context).toEqual({
        user: undefined,
        service: req.service,
        auth: {
          isAuthenticated: false,
          isService: true,
        },
      });
    });
  });

  describe('Access Validation', () => {
    it('should allow service access', async () => {
      const context = {
        service: { serviceId: 'service1', type: 'service' },
        auth: { isService: true },
      };

      await expect(authService.validateAccess(context, { auth: true }))
        .resolves.toBe(true);
    });

    it('should validate authentication requirement', async () => {
      const context = {
        auth: { isAuthenticated: false },
      };

      await expect(authService.validateAccess(context, { auth: true }))
        .rejects.toThrow(AuthenticationError);
    });

    it('should validate role requirement', async () => {
      const context = {
        user: { role: 'USER' },
        auth: { isAuthenticated: true },
      };

      await expect(authService.validateAccess(context, { role: 'ADMIN' }))
        .rejects.toThrow(ForbiddenError);
    });

    it('should validate permission requirement', async () => {
      const context = {
        user: { permissions: ['read'] },
        auth: { isAuthenticated: true },
      };

      await expect(authService.validateAccess(context, { permission: 'write' }))
        .rejects.toThrow(ForbiddenError);
    });
  });

  describe('Auth Directive', () => {
    it('should create field visitor', () => {
      const directive = authService.authDirective({ requires: { auth: true } });
      expect(directive.fieldVisitor).toBeDefined();
    });

    it('should create type visitor', () => {
      const directive = authService.authDirective({ requires: { auth: true } });
      expect(directive.typeVisitor).toBeDefined();
    });

    it('should wrap field resolver', () => {
      const directive = authService.authDirective({ requires: { auth: true } });
      const field = {
        resolve: () => 'test',
      };

      directive.fieldVisitor(field);
      expect(field.resolve).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete auth flow', async () => {
      // Create service token
      const serviceToken = authService.createServiceToken('service1');

      // Setup request with service token
      const req = {
        headers: {
          'x-service-token': serviceToken,
        },
      };

      // Process through middleware
      await authService.subgraphAuthMiddleware(req, {}, () => {});

      // Create context
      const context = authService.createContext({ req });

      // Validate access
      await expect(authService.validateAccess(context, { auth: true }))
        .resolves.toBe(true);
    });

    it('should handle user authentication flow', async () => {
      // Create user token
      const payload = { userId: '123', role: 'ADMIN', permissions: ['read', 'write'] };
      const token = jwt.sign(payload, TEST_JWT_SECRET);

      // Setup request with user token
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      // Process through middleware
      await authService.subgraphAuthMiddleware(req, {}, () => {});

      // Create context
      const context = authService.createContext({ req });

      // Validate different access requirements
      await expect(authService.validateAccess(context, { auth: true }))
        .resolves.toBe(true);
      await expect(authService.validateAccess(context, { role: 'ADMIN' }))
        .resolves.toBe(true);
      await expect(authService.validateAccess(context, { permission: 'write' }))
        .resolves.toBe(true);
    });
  });
});