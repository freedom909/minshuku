import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

describe('Authentication Tests', () => {
  describe('Google OAuth', () => {
    test('should verify Google token', async () => {
      const client = new OAuth2Client();
      const mockToken = 'mock-google-token';
      
      const ticket = await client.verifyIdToken({
        idToken: mockToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      expect(payload).toBeDefined();
    });
  });

  describe('JWT', () => {
    test('should generate and verify JWT token', () => {
      const userData = {
        id: '123',
        email: 'test@example.com'
      };
      
      const token = jwt.sign(
        userData,
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      expect(decoded.email).toBe(userData.email);
    });
  });
});