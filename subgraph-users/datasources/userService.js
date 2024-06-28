import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { hashPassword, checkPassword } from '../../infrastructure/helpers/passwords.js';
import { RESTDataSource } from '@apollo/datasource-rest';
class UserService extends RESTDataSource {
  constructor(userRepository, userCollection) {
    super();
    this.baseURL = 'http://localhost:4011/';
    this.userRepository = userRepository;
    this.userCollection = userCollection; // Assuming this is for MongoDB
  }

  async register({ email, password, name, nickname, role, picture }) {
    const existingUser = await this.userRepository.findOne({ nickname });
    if (existingUser) {
      throw new GraphQLError('Nickname is already in use, please use another one', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = new User({
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture
    });

    try {
      const result = await this.userRepository.save(newUser);
      const payload = { _id: result._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return { ...result._doc,_id: result._id , token };
    } catch (e) {
      console.error('Registration error:', e);
      throw new GraphQLError('Email is already in use or an internal server error occurred', {
        extensions: { code: 'SERVER_ERROR' }
      });
    }
  }

  async login({ email, password }) {
    const existingUser = await this.userRepository.findOne({ email });
    if (!existingUser) {
      throw new GraphQLError('User does not exist', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const passwordMatch = await checkPassword(password, existingUser.password);
    if (!passwordMatch) {
      throw new GraphQLError('Incorrect password', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const payload = { id: existingUser._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { token };
  }

  async getUserByNicknameFromDb(nickname) {
    return await this.userRepository.findOne({ nickname });
  }

  async getUserByEmailFromDb(email) {
    return await this.userCollection.findOne({ email });
  }

  async updateUser(userId, newData) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, newData, { new: true });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new GraphQLError('Error updating user', {
        extensions: { code: 'SERVER_ERROR' }
      });
    }
  }

  async deleteUser(userId) {
    try {
      const result = await this.userRepository.findByIdAndDelete(userId);
      if (result) {
        console.log('Successfully deleted one document.');
      } else {
        console.log('No documents matched the query. Deleted 0 documents.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new GraphQLError('Error deleting user', {
        extensions: { code: 'SERVER_ERROR' }
      });
    }
  }
}

export default UserService;
