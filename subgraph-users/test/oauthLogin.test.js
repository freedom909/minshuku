import { describe, it, expect, vi } from 'vitest';
import { GraphQLError } from 'graphql';
import { oauthLogin } from '../resolvers.js';
import OAuthService from '../services/userService/oauthService.js';

// Mock OAuthService
vi.mock('../services/userService/oauthService.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    validateProviderToken: vi.fn(),
    getUserInfoFromProvider: vi.fn(),
    loginWithProvider: vi.fn()
  }))
}));

describe('oauthLogin resolver', () => {
  const mockContext = {
    dataSources: {
      userService: {
        oAuthService: new OAuthService(),
        tokenService: {
          generateToken: vi.fn().mockReturnValue('mock-jwt-token')
        },
        userRepository: {
          findByOAuthId: vi.fn(),
          findByEmail: vi.fn(),
          createUser: vi.fn()
        }
      }
    }
  };

  it('should successfully login with valid OAuth token', async () => {
    const input = {
      provider: 'google',
      token: 'valid-oauth-token'
    };

    // Mock service responses
    mockContext.dataSources.userService.oAuthService.validateProviderToken
      .mockResolvedValue(true);
    mockContext.dataSources.userService.oAuthService.getUserInfoFromProvider
      .mockResolvedValue({
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        id: 'oauth-id-123'
      });
    mockContext.dataSources.userService.userRepository.findByOAuthId
      .mockResolvedValue({
        _id: 'user-id-123',
        email: 'test@example.com',
        role: 'GUEST'
      });

    const result = await oauthLogin(null, { input }, mockContext);

    expect(result).toEqual({
      token: 'mock-jwt-token',
      success: true,
      code: 200,
      message: 'Login successful',
      userId: 'user-id-123',
      role: 'GUEST'
    });
  });

  it('should throw error for invalid OAuth token', async () => {
    const input = {
      provider: 'google',
      token: 'invalid-token'
    };

    mockContext.dataSources.userService.oAuthService.validateProviderToken
      .mockRejectedValue(new GraphQLError('Invalid token'));

    await expect(oauthLogin(null, { input }, mockContext))
      .rejects.toThrow('Invalid token');
  });

  it('should create new user if not found', async () => {
    const input = {
      provider: 'google',
      token: 'valid-oauth-token'
    };

    // Mock service responses
    mockContext.dataSources.userService.oAuthService.validateProviderToken
      .mockResolvedValue(true);
    mockContext.dataSources.userService.oAuthService.getUserInfoFromProvider
      .mockResolvedValue({
        email: 'new@example.com',
        name: 'New User',
        picture: 'https://example.com/new-avatar.jpg',
        id: 'oauth-id-456'
      });
    mockContext.dataSources.userService.userRepository.findByOAuthId
      .mockResolvedValue(null);
    mockContext.dataSources.userService.userRepository.createUser
      .mockResolvedValue({
        _id: 'new-user-id',
        email: 'new@example.com',
        role: 'GUEST'
      });

    const result = await oauthLogin(null, { input }, mockContext);

    expect(result).toEqual({
      token: 'mock-jwt-token',
      success: true,
      code: 200,
      message: 'Login successful',
      userId: 'new-user-id',
      role: 'GUEST'
    });
  });

  it('should throw error for missing provider or token', async () => {
    const input = {
      provider: '',
      token: ''
    };

    await expect(oauthLogin(null, { input }, mockContext))
      .rejects.toThrow('Invalid third-party login input');
  });
});
