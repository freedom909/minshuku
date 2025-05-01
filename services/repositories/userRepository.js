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
  constructor({ mongodb }) {
    super();
    this.model = User; // Set the model to the imported User model
    this.collection = mongodb.collection('users');
    this.emailVerification = new EmailVerification();
  }

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
    try {
      return await this.collection.findOneAndUpdate(
        { _id: new ObjectId() },
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
    try {
      return await this.collection.findOne({ nickname });
    } catch (error) {
      console.error('Error during getUserByNicknameFromDb:', error);
      throw error;
    }
  }

  async getUserFromDb(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ObjectId format");
      }

      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error during getUserFromDb:", error);
      throw error;
    }
  }

  async getUserByEmailFromDb(email) {
    try {
      console.log("🔍 Searching for user with email:", email);
      console.log("📂 Collection name:", this.collection.collectionName);

      const user = await this.collection.findOne({ email });

      if (!user) {
        console.warn("⚠️ No user found with email:", email);
      }

      return user;
    } catch (error) {
      console.error('Error during getUserByEmailFromDb:', error);
      throw error;
    }
  }

  async checkPassword(password, hashedPassword) {
    if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
      throw new TypeError('Arguments must be of type string');
    }
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new Error('Error comparing passwords');
    }
  }

  async hashPassword(password) {
    if (typeof password !== 'string') {
      throw new TypeError('Argument must be of type string');
    }
    const saltRounds = 10;
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Error hashing password');
    }
  }

  async generateToken(payload) {
    console.log('Payload received for token generation:', payload);

    const jwtSecret = process.env.JWT_SECRET || 'good';

    if (!payload || !payload._id) {
      throw new Error('Invalid payload: _id is required to generate a token');
    }

    return sign(payload, jwtSecret, {
      algorithm: 'HS256',
      subject: payload._id.toString(),
      expiresIn: '1h',
    });
  }

  async sendVerificationEmail(email, token) {
    await this.emailVerification.sendVerificationEmail(email, token);
  }

  async findById(id) {
    try {
      const query = { _id: new ObjectId() };
      return await this.collection.findOne(query);
    } catch (error) {
      console.error('Error during findById:', error);
      throw error;
    }
  }

  async updatePassword(id, hashedPassword) {
    try {
      return await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword } }
      );
    } catch (error) {
      console.error('Error during updatePassword:', error);
      throw error;
    }
  }

  async findByOAuthId(oauthId) {
    return await User.findOne({ oauthId });
  }
  
  async insertUser(userData) {
    try {
      //const id = new ObjectId(); // ✅ Ensure _id is generated
      console.log("🛠️ Inserting User Data:", userData);

      const result = await this.collection.insertOne(userData);

      if (result.acknowledged && result.insertedId) {
        console.log("✅ User successfully inserted:", result.insertedId);
        return { _id: result.insertedId, ...userData }; // ✅ Return _id properly
      } else {
        throw new Error("❌ Insert operation failed, no _id returned.");
      }
    } catch (error) {
      console.error("❌ Error during insertOne:", error);
      throw error;
    }
  }

}

export default UserRepository;