// services/repositories/userRepository.js
import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';


class UserRepository {
  constructor() {
    this.model = User;
  }

async findByProviderAndSub(provider, sub) {
    return await User.findOne({ provider, sub });
  }

  async mapMongoUser(userDoc) {
    if (!userDoc) return null;
    const { _id, ...rest } = userDoc;
    return { id: _id.toString(), ...rest };
  }

 async createOAuthUser({ email, name, picture, provider, sub, oauthId, role, kycVerified }) {
  const user = new User({
    email,
    name,
    picture,
    provider: provider.toLowerCase(), // ✅ normalize to lowercase
    sub,
    oauthId,
    role: role || "USER",
    kycVerified: kycVerified ?? false,
  });
  return await user.save();
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

  async findOne(query) {
    try {
      return await this.model.findOne(query);
    } catch (error) {
      console.error('Error during findOne:', error);
      throw error;
    }
  }

  async findByOAuthId(provider, oauthId) {
    return await this.model.findOne({ provider, oauthId });
  }

  async upsertUser({ email, name, picture, provider, sub }) {
    try {
      const query = { provider, sub };
      const update = {
        email,
        name,
        picture,
        updatedAt: new Date()
      };
      const options = {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      };
  
      const user = await this.model.findOneAndUpdate(query, update, options);
      return user;
    } catch (error) {
      console.error('⚠️ upsertUser failed:', error);
      throw error;
    }
  }


  async getUserByEmailFromDb(email) { 
    if (!email || typeof email!=='string') {
      throw new TypeError('Email must be a valid string');
    }
    try {
      const user = await this.model.findOne({ email: email.trim() });
      if (!user) {
        console.log('No user found for email:', email);
        return null;
      }
      console.log('User found:', {
        id: user?._id?.toString() ?? 'N/A',
        email: user?.email ?? 'N/A'
      });
      
      return user;
    } catch (error) {
      console.error('Error in getUserByEmailFromDb:', error);
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

  async findUserByProvider({ email, provider }) {
    return await this.model.findOne({ email, provider }).lean();
  }

  async checkUserExists(email) {
    const isUserExists = await this.getUserByEmailFromDb(email);
    if (isUserExists) {
      throw new Error('User already exists');
    }
  }

  async createUser(userData) {
    console.log('Creating user with data:', userData); 
    if (!userData || typeof userData !== 'object') {
      throw new TypeError('User data must be an object');
    }
    try {
      await this.checkUserExists(userData.email);
      const newUser = new this.model.create(userData);
      const token = tokenService.generateToken({ id: newUser._id, role: newUser.role });
      const refreshToken = tokenService.generateRefreshToken({ id: newUser._id });
      newUser.auth={
        token,
        refreshToken
      }
      const savedUser = await newUser.save();
      await this.mapMongoUser(savedUser);
      return savedUser;
      console.log('User created successfully:', savedUser);
    } catch (error) {
      console.error('Error during createUser:', error);
      throw error;
    }
  }

}
export default UserRepository;