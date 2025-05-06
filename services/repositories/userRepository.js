import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import BaseRepository from './baseRepository.js';
import mongoose from 'mongoose';
import User from '../models/user.js';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { MongoClient, ObjectId } from 'mongodb';
import EmailVerification from '../../infrastructure/email/emailVerification.js';

class UserRepository extends BaseRepository {
  constructor({ mongodb, emailVerification }) {
    super();
    this.model = User;
    this.collection = mongodb.collection('users');
    this.emailVerification = new EmailVerification();
  }

  async findOne(query) {
    try {
      return await this.collection.findOne(query);
    } catch (error) {
      console.error('Error during findOne:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId");
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error during findById:', error);
      throw error;
    }
  }

  async findByIdAndUpdate(id, update) {
    try {
      return await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      );
    } catch (error) {
      console.error('Error during findByIdAndUpdate:', error);
      throw error;
    }
  }

  async findByIdAndDelete(id) {
    try {
      return await this.collection.findOneAndDelete({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error during findByIdAndDelete:', error);
      throw error;
    }
  }

  async getUserByNicknameFromDb(nickname) {
    return await this.collection.findOne({ nickname });
  }

  async getUserFromDb(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid ObjectId format");
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async getUserByEmailFromDb(email) {
    return await this.collection.findOne({ email });
  }

  async findUserByProvider({ email, provider }) {
    return await this.collection.findOne({ email, provider });
  }

  async insertUser(userData) {
    const result = await this.collection.insertOne(userData);
    if (!result.insertedId) throw new Error('Failed to insert user');
    return { ...userData, _id: result.insertedId };
  }

  async updatePassword(id, hashedPassword) {
    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } }
    );
  }

  async checkPassword(password, hashedPassword) {
    if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
      throw new TypeError('Arguments must be strings');
    }
    return await bcrypt.compare(password, hashedPassword);
  }

  async hashPassword(password) {
    if (typeof password !== 'string') {
      throw new TypeError('Password must be a string');
    }
    return await bcrypt.hash(password, 10);
  }

  async generateToken(user) {
    if (!user || !user._id) throw new Error('User must have _id');
    return sign(
      { id: user._id },
      process.env.JWT_SECRET || 'good',
      { algorithm: 'HS256', expiresIn: '1h' }
    );
  }

  async sendVerificationEmail(email, token) {
    await this.emailVerification.sendVerificationEmail(email, token);
  }

  async findByOAuthId(oauthId) {
    return await this.model.findOne({ oauthId });
  }
}

export default UserRepository;
