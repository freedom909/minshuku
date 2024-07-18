import { hashPassword, checkPassword } from './helpers/passwords.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import EmailVerification from './email/emailVerification.js';
import axios from 'axios';

class UserRepository {
  constructor(db) {
    this.userCollection = db.collection('users');
    this.emailVerification = new EmailVerification();
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4011', // Adjust as needed
    });
  }

  // Database interactions
  async insertUser(user) {
    return await this.userCollection.insertOne(user);
  }

  async getUserByNicknameFromDb(nickname) {
    return await this.userCollection.findOne({ nickname });
  }

  async getUserByEmailFromDb(email) {
    return await this.userCollection.findOne({ email });
  }

  // Password methods
  async checkPassword(password, hashedPassword) {
    return await checkPassword(password, hashedPassword);
  }

  async hashPassword(password) {
    return await hashPassword(password);
  }

  // Token generation
  async generateToken(payload) {
    const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret';
    return sign(payload, jwtSecret, {
      algorithm: 'HS256',
      subject: payload._id.toString(),
      expiresIn: '1h',
    });
  }

  // Email verification
  async sendVerificationEmail(email, token) {
    await this.emailVerification.sendVerificationEmail(email, token);
  }

  // API interactions
  async getUserByEmailFromApi(email) {
    const url = `/user`;
    const body = { email };
    try {
      const result = await this.httpClient.post(url, body);
      return result.data[0];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No user found
      }
      throw error; // Rethrow other errors
    }
  }

  async getUserByIdFromApi(userId) {
    const url = `/user/${userId}`;
    try {
      const result = await this.httpClient.get(url);
      return result.data[0];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No user found
      }
      throw error; // Rethrow other errors
    }
  }

  async getUserByNicknameFromApi(nickname) {
    const url = `/user`;
    const body = { nickname };
    try {
      const result = await this.httpClient.post(url, body);
      return result.data[0];
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // No user found
      }
      throw error; // Rethrow other errors
    }
  }
}

export default UserRepository;
