import { hashPassword, checkPassword } from '../helpers/passwords.js';
import BaseRepository from './baseRepository.js'
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import pkg1 from 'mongodb';
const { MongoClient, ObjectId } = pkg1;
import EmailVerification from '../email/emailVerification.js';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

import { GraphQLError } from 'graphql';
class UserRepository extends BaseRepository {
  constructor({ mongodb }) {
    super();
    this.collection = mongodb.collection('users');
    this.emailVerification = new EmailVerification();
  }

 
  // Additional methods for UserRepository can be added here
  async findOne(query) {
    try {
      console.log('query:', query);
      return await this.collection.findOne(query);
    } catch (error) {
      console.error('Error during findOne:', error);
      throw error;
    }
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
    return await this.collection.findOne({ nickname });
  }

  async getUserFromDb(id) {
    const query = { _id: new ObjectId("id") };
    return await this.collection.findOne(query);
  }

  async getUserByEmailFromDb(email) {
    try {
      const user=await this.collection.findOne({ email: email });
      return user
    } catch (error) {
      console.error('Error during findOne:', error);
      throw error;
    }
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
    const jwtSecret = process.env.JWT_SECRET 
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

  async findById(id) {
    const query = { _id: ObjectId.createFromHexString(id) };
    return await this.collection.findOne(query);
  }

  async updatePassword(id, hashedPassword) {
    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } }
    );
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
  async findByIdAndUpdate(id, update, options) {
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      options
    );
    return result.value;
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

  async getUserById(id) {
    return this.db.users.findOne({ where: { id } });
  }

  async getAccountById(id) {
    return this.db.accounts.findOne({ where: { id } });
  }

  async getAllAccounts() {
    return this.db.accounts.findAll();
  }

  async createUser(user) {
    return this.db.users.create(user);
  }

  async createAccount(account) {
    return this.db.accounts.create(account);
  }

  async deleteAccount(id) {
    return this.db.accounts.destroy({ where: { id } });
  }

  async updateAccountEmail(id, email) {
    return this.db.accounts.update({ email }, { where: { id } });
  }

  async updateAccountPassword(id, password) {
    return this.db.accounts.update({ password }, { where: { id } });
  }

  async updateUser(userId, userInfo) {
    return this.db.users.update(userInfo, { where: { id: userId } });
  }
}

export default UserRepository;