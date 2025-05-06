import { jest } from '@jest/globals'; // REQUIRED for ESM
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserRepository from '../services/repositories/userRepository.js';
import EmailVerification from '../infrastructure/email/emailVerification.js';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
jest.mock('../infrastructure/email/emailVerification.js', () => {
  return jest.fn().mockImplementation(() => ({
    sendVerificationEmail: jest.fn()
  }));
});

describe('UserRepository', () => {
  let userRepository;
  let mockCollection;
  let mockMongoDb;
  let mockEmailVerification;

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockMongoDb = {
      collection: jest.fn(() => mockCollection)
    };

    mockEmailVerification = new EmailVerification();

    userRepository = new UserRepository({ 
      mongodb: mockMongoDb,
      emailVerification: mockEmailVerification
    });
  });

  describe('insertUser', () => {
    it('should insert user and return user with _id', async () => {
      const userData = { email: 'test@example.com' };
      const fakeId = '507f1f77bcf86cd799439011';
      mockCollection.insertOne.mockResolvedValue({
        acknowledged: true,
        insertedId: fakeId
      });

      const result = await userRepository.insertUser(userData);
      expect(result).toEqual({ _id: fakeId, ...userData });
    });

    it('should throw error if insert failed', async () => {
      mockCollection.insertOne.mockResolvedValue({ acknowledged: false });

      await expect(userRepository.insertUser({})).rejects.toThrow('Failed to insert user');
    });
  });

  describe('getUserByEmailFromDb', () => {
    it('should return user by email', async () => {
      const user = { email: 'test@example.com' };
      mockCollection.findOne.mockResolvedValue(user);

      const result = await userRepository.getUserByEmailFromDb('test@example.com');
      expect(result).toBe(user);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });

  describe('checkPassword', () => {
    it('should compare passwords correctly', async () => {
      // 修正模拟方法调用
      const mockCompare = jest.requireMock('bcrypt').compare;
      mockCompare.mockResolvedValue(true);
      const result = await userRepository.checkPassword('plain', 'hashed');
      expect(result).toBe(true);
      expect(mockCompare).toHaveBeenCalledWith('plain', 'hashed');
    });
  });

  describe('generateToken', () => {
    it('should return a signed JWT token', async () => {
      // 修正模拟方法调用
      const mockSign = jest.requireMock('jsonwebtoken').sign;
      mockSign.mockReturnValue('fake.jwt.token');
      const result = await userRepository.generateToken({ _id: '123' });
      expect(result).toBe('fake.jwt.token');
    });

    it('should throw error for missing _id', async () => {
      await expect(userRepository.generateToken({})).rejects.toThrow('User must have _id');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should call emailVerification.sendVerificationEmail', async () => {
      const mockSend = mockEmailVerification.sendVerificationEmail;
      await userRepository.sendVerificationEmail('test@example.com', 'token123');
      expect(mockSend).toHaveBeenCalledWith('test@example.com', 'token123');
    });
  });
});