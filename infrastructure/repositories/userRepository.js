import { hashPassword, checkPassword } from '../helpers/passwords.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import EmailVerification from '../email/emailVerification.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()
class UserRepository {
  constructor(db) {
    console.log('db object in UserRepository constructor:', db); // Debugging line
    if (!db || typeof db.collection !== 'function') {
      throw new Error('Invalid db object');
    }
    this.collection = db.collection('users');
    console.log('collection object:', this.collection); // Add this line to log the collection object
    this.emailVerification = new EmailVerification();
    this.httpClient = axios.create({
      baseURL: 'http://localhost:4011', // Adjust as needed
    });
  }

  // Additional methods for UserRepository can be added here
  async findOne(query) {
    return await this.collection.findOne(query);
  }

async findByIdAndUpdate(id, update) {
    return await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  async save(user) {
    const result = await this.collection.insertOne(user);
    if (!result.insertedId) {
      throw new Error('Failed to insert user');
    }
    return { ...user, _id: result.insertedId };
  }
  // Database interactions
  async insertUser(user) {
    return await this.collection.insertOne(user);
  }
  async findByIdAndUpdate(id, update) {
    return await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' }
    );
  }
  async findByIdAndDelete(id) {
    return await this.collection.findOneAndDelete({ _id: id });
  }
  async getUserByNicknameFromDb(nickname) {
    return await this.userCollection.findOne({ nickname });
  }

  async getUserFromDb(id) {
    return await this.userCollection.findOne({ _id: new ObjectId(id) });
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

// infrastructure/repositories/userRepository.js




  async save(user) {
    const result = await this.collection.insertOne(user);
    if (!result.insertedId) {
      throw new Error('Failed to insert user');
    }
    return { ...user, _id: result.insertedId };
  }

  async findByIdAndUpdate(id, update) {
    return await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' }
    );
  }

  async findByIdAndDelete(id) {
    return await this.collection.findOneAndDelete({ _id: id });
  }
}

export default UserRepository;

