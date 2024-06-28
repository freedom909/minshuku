import { RESTDataSource } from '@apollo/datasource-rest';
import User from '../models/user.js'; // Adjust the path according to your new structure
import { hashPassword, checkPassword } from '../helpers/passwords.js'; // Adjust the path accordingly
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

class UserService extends RESTDataSource {
  constructor(userRepository) {
    super();
    this.baseURL = 'http://localhost:4011/';
    this.userRepository = userRepository;
  }

  async register({ email, password, name, nickname, role, picture }) {
    const existingUser = await this.userRepository.findOne({ nickname });
    if (existingUser) {
      throw new GraphQLError('Nickname is already in use, please use another one', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture
    };

    try {
      const result = await this.userRepository.insertUser(newUser);
      console.log('User successfully inserted:', result);

      const payload = { _id: result.insertedId.toString() };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('JWT token generated:', token);

      return {
        userId: result.insertedId.toString(),  // Ensure this is not null
        token
      };
    } catch (e) {
      console.error('Error during registration:', e);

      if (e.code === 11000) {
        throw new GraphQLError('Email is already in use', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      throw new GraphQLError('An internal server error occurred', {
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

  async updateUser(userId, newData) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, newData);
      return updatedUser.value;
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
      if (result.value) {
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