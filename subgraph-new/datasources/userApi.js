import { RESTDataSource } from '@apollo/datasource-rest';
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { hashPassword, checkPassword } from '../../infrastructure/helpers/passwords.js';
import axios from 'axios';
import validRegister from '../../infrastructure/utils/valid.js';
// import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

// const hashPassword = async (password) => {
//   const saltRounds = 10;
//   return await bcrypt.hash(password, saltRounds);
// };

class UsersAPI extends RESTDataSource {
  constructor({ db }) {
    super();
    this.usersCollection = db.collection('User');
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4000', // Adjust as needed
    });
    console.log('UsersAPI instance created with DB:', db.databaseName);
  }

  async register({ email, password, name, nickname, role, picture }) {
    const existingUser = await this.getUserByNickname({ nickname });
    if (existingUser) {
      throw new GraphQLError('Nickname is already in use, please use another one', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      email,
      name,
      password: passwordHash,
      nickname,
      role,
      picture,
    };

    try {
      const result = await this.usersCollection.insertOne(newUser);
      if (!result.insertedId) {
        throw new Error('Failed to insert user');
      }

      const payload = { _id: result.insertedId };
      const token = jwt.sign(payload, process.env.JWT_SECRETKEY, {
        algorithm: 'HS256',
        subject: result.insertedId.toString(),
        expiresIn: '1d',
      });

      // Uncomment this when email verification is set up
      // await this.emailVerification.sendActivationEmail(email, token);

      return { ...newUser, id: result.insertedId, token };
    } catch (e) {
      console.error('Registration error:', e);
      throw new GraphQLError('Email is already in use or an internal server error occurred', {
        extensions: { code: 'SERVER_ERROR' },
      });
    }
  }

  async getUserByNickname({ nickname }) {
    return await this.usersCollection.findOne({ nickname });
  }
}

export default UsersAPI;

