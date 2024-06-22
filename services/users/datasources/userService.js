import User from '../../../infrastructure/models/user.js';
import { validRegister, validLogin } from '../../../infrastructure/helpers/valid.js';
import { hashPassword, checkPassword } from '../../../infrastructure/helpers/passwords.js';
import { GraphQLError } from 'graphql';
import { RESTDataSource } from "@apollo/datasource-rest";
import jwt from 'jsonwebtoken';

class UserService extends RESTDataSource{
  constructor() {
    super();
    this.baseURL = 'http://localhost:4000/';
  }
  async register({ email, password, name, nickname, role, picture }) {
    if (validRegister({ email, password, name, nickname, role, picture })) {
      const existingUser = await User.findOne({ nickname });
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
        const result = await newUser.save();
        const payload = { _id: result._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email (implement this function as needed)
        // await sendVerificationEmail(email, token);

        return { ...result._doc, token };
      } catch (e) {
        console.error('Registration error:', e);
        throw new GraphQLError('Email is already in use or an internal server error occurred', {
          extensions: { code: 'SERVER_ERROR' }
        });
      }
    }
  }

  async login({ email, password }) {
    if (validLogin(email, password)) {
      const existingUser = await User.findOne({ email });
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
}

export default UserService;
