import { resolvers } from './resolvers.js';

// Mock dependencies
const mockContainer = {
  resolve: (service) => {
    if (service === 'logger') {
      return {
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      };
    } else if (service === 'accountLockService') {
      return {
        isAccountLocked: jest.fn(),
        getLockDetails: jest.fn(),
        recordFailedAttempt: jest.fn(),
        clearLock: jest.fn(),
      };
    } else if (service === 'userService') {
      return {
        oauthLogin: jest.fn(),
        login: jest.fn(),
        tokenService: {
          revokeProviderToken: jest.fn(),
        },
      };
    }
    return null;
  },
};

// Mock request and user objects
const mockReq = {
  session: {
    destroy: jest.fn((cb) => cb(null)),
  },
};
const mockUser = { id: '123', role: 'user' };

describe('Resolvers', () => {
  describe('signIn', () => {
    it('should throw an error for invalid input', async () => {
      await expect(resolvers.Mutation.signIn(null, { input: {} }, { container: mockContainer })).rejects.toThrow('Invalid sign-in input: must provide either email/password or provider/token');
    });

    it('should throw an error for locked account', async () => {
      const mockEmail = 'test@example.com';
      mockContainer.resolve('accountLockService').isAccountLocked.mockResolvedValue(true);
      mockContainer.resolve('accountLockService').getLockDetails.mockResolvedValue({ remainingTime: 60 });
      await expect(resolvers.Mutation.signIn(null, { input: { email: mockEmail, password: 'password' } }, { container: mockContainer })).rejects.toThrow('Account temporarily locked due to too many failed attempts');
    });

    it('should handle successful OAuth login', async () => {
      const mockResponse = {
        code: 200,
        success: true,
        message: 'Login successful',
        token: 'mock-token',
        userId: '123',
        role: 'user',
        refreshToken: 'mock-refresh-token',
      };
      mockContainer.resolve('userService').oauthLogin.mockResolvedValue(mockResponse);
      const result = await resolvers.Mutation.signIn(null, { input: { provider: 'GOOGLE', token: 'mock-token' } }, { container: mockContainer });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should handle successful logout', async () => {
      mockContainer.resolve('userService').tokenService.revokeProviderToken.mockResolvedValue();
      const result = await resolvers.Mutation.logout(null, { input: { provider: 'GOOGLE', token: 'mock-token' } }, { container: mockContainer, req: mockReq, logger: mockContainer.resolve('logger'), user: mockUser });
      expect(result).toEqual({ success: true, message: 'Logout successful' });
    });

    it('should throw an error on logout failure', async () => {
      const mockError = new Error('Logout error');
      mockContainer.resolve('userService').tokenService.revokeProviderToken.mockRejectedValue(mockError);
      await expect(resolvers.Mutation.logout(null, { input: { provider: 'GOOGLE', token: 'mock-token' } }, { container: mockContainer, req: mockReq, logger: mockContainer.resolve('logger'), user: mockUser })).rejects.toThrow('Logout failed');
    });
  });

  describe('validateOAuthToken', () => {
    it('should return true for valid Google token', () => {
      const result = resolvers.Mutation.validateOAuthToken(null, { provider: 'GOOGLE', token: 'test-token' });
      expect(result).toBe(true);
    });

    it('should throw an error for invalid token', () => {
      expect(() => resolvers.Mutation.validateOAuthToken(null, { provider: 'GOOGLE', token: 'invalid-token' })).toThrow('Invalid token');
    });
  });
});