import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { permissions, bookingsWithPermission, listingsWithPermission } from './permission.js';
import { authenticate, authorize } from './authenticateAndAuthorize.js';
import User from '../../services/models/user.js';
import Booking from '../../services/models/booking.js';
import Listing from '../../services/models/listing.js';

// Mock the models
jest.mock('../../services/models/user.js');
jest.mock('../../services/models/booking.js');
jest.mock('../../services/models/listing.js');

describe('Authentication and Authorization Tests', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  
  // Test data
  const mockUser = {
    id: 'user123',
    role: 'GUEST',
  };
  
  const mockAdmin = {
    id: 'admin123',
    role: 'ADMIN',
  };
  
  const mockHost = {
    id: 'host123',
    role: 'HOST',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Authentication Middleware', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign(mockUser, JWT_SECRET);
      const req = { headers: { authorization: token } };
      const res = {};
      const next = jest.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(mockUser.id);
    });

    it('should reject invalid token', () => {
      const req = { headers: { authorization: 'invalid-token' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Authorization Middleware', () => {
    it('should authorize user with correct role', () => {
      const req = { user: mockAdmin };
      const res = {};
      const next = jest.fn();

      authorize('ADMIN')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      const req = { user: mockUser };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authorize('ADMIN')(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'You do not have the necessary permissions' 
      });
    });
  });

  describe('Permission Rules', () => {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        user: { id: 'user123' },
      };
    });

    describe('isAuthenticated', () => {
      it('should allow authenticated user', async () => {
        const result = await permissions.Query.me.resolve(
          null,
          {},
          mockContext,
          {}
        );
        expect(result).toBe(true);
      });

      it('should reject unauthenticated user', async () => {
        mockContext.user = null;
        await expect(
          permissions.Query.me.resolve(null, {}, mockContext, {})
        ).rejects.toThrow();
      });
    });

    describe('isAdmin', () => {
      beforeEach(() => {
        User.findById.mockImplementation((id) => {
          return Promise.resolve({ id, role: id === 'admin123' ? 'ADMIN' : 'GUEST' });
        });
      });

      it('should allow admin user', async () => {
        mockContext.user = { id: 'admin123' };
        const result = await permissions.Mutation.createUserOK.resolve(
          null,
          {},
          mockContext,
          {}
        );
        expect(result).toBe(true);
      });

      it('should reject non-admin user', async () => {
        mockContext.user = { id: 'user123' };
        await expect(
          permissions.Mutation.createUserOK.resolve(null, {}, mockContext, {})
        ).rejects.toThrow();
      });
    });

    describe('Booking Permissions', () => {
      beforeEach(() => {
        Booking.findById.mockImplementation((id) => {
          return Promise.resolve({ id, guestId: 'user123' });
        });
      });

      it('should allow booking owner', async () => {
        const result = await bookingsWithPermission.resolve(
          null,
          { id: 'booking123' },
          mockContext,
          {}
        );
        expect(result).toBe(true);
      });

      it('should reject non-owner', async () => {
        mockContext.user = { id: 'other123' };
        await expect(
          bookingsWithPermission.resolve(null, { id: 'booking123' }, mockContext, {})
        ).rejects.toThrow();
      });
    });

    describe('Listing Permissions', () => {
      beforeEach(() => {
        Listing.findById.mockImplementation((id) => {
          return Promise.resolve({ id, hostId: 'host123' });
        });
        User.findById.mockImplementation((id) => {
          return Promise.resolve({ id, role: id === 'host123' ? 'HOST' : 'GUEST' });
        });
      });

      it('should allow listing host', async () => {
        mockContext.user = { id: 'host123' };
        const result = await listingsWithPermission.resolve(
          null,
          { id: 'listing123' },
          mockContext,
          {}
        );
        expect(result).toBe(true);
      });

      it('should reject non-host', async () => {
        mockContext.user = { id: 'user123' };
        await expect(
          listingsWithPermission.resolve(null, { id: 'listing123' }, mockContext, {})
        ).rejects.toThrow();
      });
    });
  });

  describe('Complex Permission Scenarios', () => {
    let mockContext;

    beforeEach(() => {
      mockContext = {
        user: { id: 'user123' },
      };
      
      User.findById.mockImplementation((id) => {
        const roles = {
          admin123: 'ADMIN',
          host123: 'HOST',
          user123: 'GUEST',
        };
        return Promise.resolve({ id, role: roles[id] || 'GUEST' });
      });

      Listing.findById.mockImplementation((id) => {
        return Promise.resolve({ id, hostId: 'host123' });
      });
    });

    it('should allow admin to update any listing', async () => {
      mockContext.user = { id: 'admin123' };
      const result = await permissions.Mutation.updateListingOK.resolve(
        null,
        { id: 'listing123' },
        mockContext,
        {}
      );
      expect(result).toBe(true);
    });

    it('should allow host to update own listing', async () => {
      mockContext.user = { id: 'host123' };
      const result = await permissions.Mutation.updateListingOK.resolve(
        null,
        { id: 'listing123' },
        mockContext,
        {}
      );
      expect(result).toBe(true);
    });

    it('should reject host updating other\'s listing', async () => {
      mockContext.user = { id: 'otherhost123' };
      await expect(
        permissions.Mutation.updateListingOK.resolve(
          null,
          { id: 'listing123' },
          mockContext,
          {}
        )
      ).rejects.toThrow();
    });

    it('should reject guest updating any listing', async () => {
      mockContext.user = { id: 'user123' };
      await expect(
        permissions.Mutation.updateListingOK.resolve(
          null,
          { id: 'listing123' },
          mockContext,
          {}
        )
      ).rejects.toThrow();
    });
  });
});