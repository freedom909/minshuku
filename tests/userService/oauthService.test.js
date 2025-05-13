import OAuthService from '../../services/userService/oauthService';
import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';

// Mock axios and OAuth2Client
jest.mock('axios');
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn(),
    })),
  };
});

const mockUserRepository = {
  getUserByEmailFromDb: jest.fn(),
  insertUser: jest.fn(),
  save: jest.fn(),
};

const mockTokenService = {
  generateToken: jest.fn(),
};

describe('OAuthService - authenticate', () => {
    let oauthService;
  
    beforeEach(() => {
      oauthService = new OAuthService({
        tokenService: mockTokenService,
        userRepository: mockUserRepository,
      });
    });
  
    it('should authenticate and return user info (Google)', async () => {
      const mockToken = 'valid-google-token';
      const mockPayload = { email: 'test@example.com', name: 'Test User', picture: 'pic.jpg' };
  
      const mockClientInstance = new OAuth2Client();
      mockClientInstance.verifyIdToken.mockResolvedValueOnce({
        getPayload: () => mockPayload,
      });
  
      mockUserRepository.getUserByEmailFromDb.mockResolvedValue(null);
      mockUserRepository.insertUser.mockResolvedValue(mockPayload);
  
      const result = await oauthService.authenticate('google', mockToken);
  
      expect(result).toEqual(mockPayload);
      expect(mockUserRepository.insertUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        picture: 'pic.jpg',
        provider: 'google',
        role: 'GUEST',
      });
    });
  });
  
  describe('OAuthService - getUserInfoFromProvider', () => {
    let oauthService;
  
    beforeEach(() => {
      oauthService = new OAuthService({
        tokenService: mockTokenService,
        userRepository: mockUserRepository,
      });
    });
  
    it('should fetch user info from provider (Google with auth header)', async () => {
      const mockResponse = {
        data: {
          id: '123',
          email: 'user@example.com',
          name: 'Test User',
          picture: 'url-to-pic',
        },
      };
  
      axios.get.mockResolvedValue(mockResponse);
  
      const result = await oauthService.getUserInfoFromProvider('google', 'token123');
      expect(result).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: 'Bearer token123' } }
      );
    });
  
    it('should fetch user info from provider (Facebook without auth header)', async () => {
      const mockResponse = {
        data: {
          id: 'fb123',
          email: 'fb@example.com',
          name: 'FB User',
          picture: { data: { url: 'fb-pic-url' } },
        },
      };
  
      axios.get.mockResolvedValue(mockResponse);
  
      const result = await oauthService.getUserInfoFromProvider('facebook', 'fb-token');
      expect(result).toEqual(mockResponse.data);
    });
  });
  
  describe('OAuthService - loginWithProvider', () => {
    let oauthService;
  
    beforeEach(() => {
      oauthService = new OAuthService({
        tokenService: mockTokenService,
        userRepository: mockUserRepository,
      });
    });
  
    it('should login existing user and return token', async () => {
      const mockUser = { id: '1', email: 'user@example.com', name: 'User' };
      const mockJwt = 'jwt-token';
      mockUserRepository.getUserByEmailFromDb.mockResolvedValue(mockUser);
      mockTokenService.generateToken.mockReturnValue(mockJwt);
  
      const result = await oauthService.loginWithProvider({
        email: 'user@example.com',
        name: 'User',
        picture: 'url',
      });
  
      expect(result).toEqual({ token: mockJwt, user: mockUser });
    });
  
    it('should create new user if not found and return token', async () => {
      const providerUser = {
        email: 'new@example.com',
        name: 'New User',
        picture: 'pic-url',
      };
  
      const newUser = { id: '2', ...providerUser };
      mockUserRepository.getUserByEmailFromDb.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(newUser);
      mockTokenService.generateToken.mockReturnValue('new-jwt');
  
      const result = await oauthService.loginWithProvider(providerUser);
      expect(result.token).toEqual('new-jwt');
      expect(result.user).toEqual(newUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        email: 'new@example.com',
        name: 'New User',
        provider: 'OAUTH',
        picture: 'pic-url',
        role: 'GUEST',
      });
    });
  });
  