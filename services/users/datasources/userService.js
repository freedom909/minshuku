import { RESTDataSource } from '@apollo/datasource-rest';
import  User  from '../models/user.js'; // Adjust the path accordingly
import { hashPassword, checkPassword } from '../../../infrastructure/helpers/passwords.js'; // Adjust the path accordingly
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

class UserService extends RESTDataSource {
  constructor(userRepository) {
    super();
    this.baseURL = 'http://localhost:4000/';
    this.userRepository = userRepository;
  }

  async register({ email, password, name, nickname, role, picture }) {
    // Validation is handled outside
    const existingUser = await this.userRepository.findOne({ nickname });
    if (existingUser) {
      throw new GraphQLError('Nickname is already in use, please use another one', {
        extensions: { code: 'BAD_USER_INPUT' }
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = new this.userRepository({
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture
    });

    try {
      const result = await newUser.save();
      const payload = { _id: result._id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      return { ...result._doc, token };
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
}

export default UserService;
