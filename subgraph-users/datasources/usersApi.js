import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { hashPassword } from '../../infrastructure/helpers/passwords.js';
import { RESTDataSource } from '@apollo/datasource-rest';
import axios from 'axios';

class UsersAPI extends RESTDataSource {
  constructor({ db }) {
    super();
    this.usersCollection = db.collection('users');
    // this.emailVerification = new EmailVerification();
    // this.googleLogin = new GoogleLogin();

    this.httpClient = axios.create({
      baseURL: 'http://localhost:4011', // Adjust as needed
    });

    console.log('UsersAPI instance created with DB:', db.databaseName);
  }

  async register({ email, password, name, nickname, role, picture }) {
    // Assuming validRegister is a function or a variable defined elsewhere
    if (validRegister) {
      const existingUser = await this.getUserByNickname({ nickname });
      if (existingUser) {
        if (existingUser.nickname === nickname) {
          throw new GraphQLError('Nickname is already in use, please use another one', {
            extensions: {
              code: 'BAD_USER_INPUT',
            },
          });
        }
      }
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

      await this.emailVerification.sendActivationEmail(email, token);

      return { ...newUser, _id: result.insertedId, token };
    } catch (e) {
      console.error('Registration error:', e);
      throw new GraphQLError('Email is already in use or an internal server error occurred', {
        extensions: {
          code: 'SERVER_ERROR',
        },
      });
    }
  }
}

export default UsersAPI;
