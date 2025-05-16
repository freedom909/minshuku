const { UserRepository } = require('../userRepository');
const User = require('../../models/user');

jest.mock('../../models/user');

describe('UserRepository', () => {
  let repo;
  
  beforeEach(() => {
    repo = new UserRepository(User);
    jest.clearAllMocks();
  });

  describe('updateUser', () => {
    it('should update user with valid data', async () => {
      const mockUser = { _id: '1', email: 'new@test.com', version: 1 };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      const result = await repo.updateUser('1', { email: 'new@test.com' });
      expect(result).toEqual(mockUser);
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { 
          $set: { email: 'new@test.com' },
          $inc: { version: 1 }
        },
        { new: true, runValidators: true }
      );
    });

    it('should handle version conflicts', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);
      
      await expect(repo.updateUser('1', { email: 'new@test.com', version: 1 }))
        .rejects.toThrow('User not found');
      
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        {
          $set: { email: 'new@test.com' },
          $inc: { version: 1 }
        },
        {
          new: true,
          runValidators: true,
          version: 1
        }
      );
    });

    it('should reject invalid user IDs', async () => {
      await expect(repo.updateUser(null, {}))
        .rejects.toThrow('User ID is required');
    });

    it('should filter out password unless explicitly updating', async () => {
      const mockUser = { _id: '1' };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      await repo.updateUser('1', { password: 'should-not-update' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { $set: {} }, // password filtered out
        expect.anything()
      );
    });
  });

  describe('findByIdAndUpdate', () => {
    it('should update with valid options', async () => {
      const mockUser = { _id: '1' };
      User.findByIdAndUpdate.mockResolvedValue(mockUser);
      
      await repo.findByIdAndUpdate('1', { name: 'Test' });
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { name: 'Test' },
        { new: true }
      );
    });
  });
});