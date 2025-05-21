// services/repositories/userRepository.js
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

class UserRepository {
  constructor({ mongodb }) {
    if (!mongodb) {
      console.error('mongodb 对象未正确传入');
      return;
    }
    this.model = User;
    this.collection = mongodb.collection('users');
  }

  async mapMongoUser(userDoc) {
    if (!userDoc) return null;
    const { _id, ...rest } = userDoc;
    return { id: _id.toString(), ...rest };
  }

  async findOne(query) {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      console.error('Error during findOne:', error);
      throw error;
    }
  }

  async findByIdAndUpdate(id, update) {
    try {
      return await this.model.findByIdAndUpdate(id, {
        $set: update,
        $inc: { version: 1 }
      }, { new: true });
    } catch (error) {
      console.error('Error during findByIdAndUpdate:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const startTime = Date.now();
      const logData = {
        userId: id,
        action: 'updateUser',
        timestamp: new Date().toISOString()
      };

      if (!id) {
        const error = new Error('User ID is required for update');
        logData.error = error.message;
        console.error(JSON.stringify(logData));
        throw error;
      }

      logData.updateFields = Object.keys(updateData).filter(k => k !== 'password');

      const safeUpdateData = { ...updateData };
      if (!safeUpdateData.password) {
        delete safeUpdateData.password;
      }

      const updatedUser = await this.model.findByIdAndUpdate(
        id,
        {
          $set: safeUpdateData,
          $inc: { version: 1 }
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedUser) {
        const error = new Error(`User not found with ID: ${id}`);
        logData.error = error.message;
        console.error(JSON.stringify(logData));
        throw error;
      }

      logData.durationMs = Date.now() - startTime;
      logData.status = 'success';
      console.log(JSON.stringify(logData));

      return updatedUser;
    } catch (error) {
      console.error(JSON.stringify({
        userId: id,
        action: 'updateUser',
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }));
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const newUser = new this.model(userData);
      const savedUser = await newUser.save();
      return this.mapMongoUser(savedUser);
    } catch (error) {
      console.error('Error during createUser:', error);
      throw error;
    }
  }

  async findByIdAndDelete(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      console.error('Error during findByIdAndDelete:', error);
      throw error;
    }
  }

  async getUserByNicknameFromDb(nickname) {
    return await this.model.findOne({ nickname });
  }

  async getUserFromDb(id) {
    try {
      const user = await this.model.findById(id);
      return this.mapMongoUser(user);
    } catch (error) {
      console.error('Error during getUserFromDb:', error);
      throw error;
    }
  }

  async getUserByEmailFromDb(email) {
    try {
      if (!email || typeof email !== 'string') {
        throw new TypeError('Email must be a valid string');
      }

      console.log('Searching user by email:', email);
      const user = await this.model.findOne({ email: email.toLowerCase().trim() });

      if (!user) {
        console.log('No user found for email:', email);
      } else {
        console.log('User found:', {
          id: user._id?.toString(),
          email: user.email
        });
      }

      return user;
    } catch (error) {
      console.error('Error in getUserByEmailFromDb:', error);
      throw error;
    }
  }

  async createOAuthUser({ email, name, picture, oauthId, provider, role }) {
    return await this.model.create({
      email,
      fullName: name,
      picture,
      oauthId,
      provider,
      role,
    });
  }

  async findUserByProvider({ email, provider }) {
    return await this.model.findOne({ email, provider }).lean();
  }

  async insertUser(userData) {
    try {
      const newUser = new this.model(userData);
      return await newUser.save();
    } catch (error) {
      console.error('Error during insertUser:', error);
      throw error;
    }
  }

  async updatePassword(id, hashedPassword) {
    try {
      return await this.model.findByIdAndUpdate(id, { password: hashedPassword });
    } catch (error) {
      console.error('Error during updatePassword:', error);
      throw error;
    }
  }

  async checkPassword(password, hashedPassword) {
    try {
      if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
        throw new TypeError('Password and hash must be strings');
      }

      if (password.length < 8) {
        throw new Error('Password too short');
      }

      const isValid = await bcrypt.compare(password, hashedPassword);
      console.log('Password validation result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Error in checkPassword:', error);
      throw error;
    }
  }

  async hashPassword(password) {
    try {
      if (typeof password !== 'string' || password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      console.error('Error in hashPassword:', error);
      throw error;
    }
  }

  async generateToken(user) {
    if (!user || !user._id) throw new Error('User must have _id');
    return jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'good',
      { algorithm: 'HS256', expiresIn: '1h' }
    );
  }

  async sendVerification(email) {
    return this.emailVerification.verify(email);
  }

  async sendVerificationEmail(email, token) {
    await this.emailVerification.sendVerificationEmail(email, token);
  }

  async findByOAuthId(provider, oauthId) {
    return await this.model.findOne({ provider, oauthId });
  }
}

export default UserRepository;
