//services/userService/localAuthService.js
import UserRepository from '../repositories/userRepository.js';
import { RESTDataSource } from "@apollo/datasource-rest";
import { GraphQLError } from 'graphql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { loginValidate } from '../../infrastructure/helpers/loginValidator.js';
import dotenv from 'dotenv';
import TokenService from './tokenService.js';
import OAuthService from './oauthService.js';

dotenv.config();


class LocalAuthService extends RESTDataSource {
  constructor({ userRepository }) {
    super();
    this.baseURL = "http://localhost:4000/";
    if (!userRepository) {
      throw new Error("UserRepository not provided to UserService");
    }
    this.userRepository = userRepository;
  }

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new GraphQLError('Email and password are required', {
          extensions: { code: 'INVALID_INPUT' }
        });
      }

      console.log('Attempting login for email:', email);
      const user = await this.userRepository.getUserByEmailFromDb(email);
      
      if (!user) {
        console.error('No user found for email:', email);
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' }
        });
      }

      console.log('Found user:', { 
        id: user._id?.toString(), 
        email: user.email 
      });

      const isPasswordValid = await this.userRepository.checkPassword(password, user.password);
      if (!isPasswordValid) {
        console.error('Invalid password for user:', user._id?.toString());
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'INVALID_CREDENTIALS' }
        });
      }

      console.log('Login successful for user:', user._id?.toString());
      return user;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof GraphQLError) {
        throw error;
      }
      throw new GraphQLError('Login failed', {
        extensions: { 
          code: 'LOGIN_FAILED',
          error: error.message
        }
      });
    }
  }

  async register(userData) {
    const existingUser = await this.userRepository.getUserByEmailFromDb(userData.email);
    if (existingUser) {
      throw new Error("❌ Email already exists. Cannot create duplicate accounts.");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = { ...userData, password: hashedPassword };

    // Make sure insertUser returns the correct format
    const createdUser = await this.userRepository.insertUser(newUser);

    if (!createdUser || !createdUser._id) {
      throw new Error("❌ Registration failed: No _id returned from insertUser.");
    }

    return createdUser; // ✅ Ensure _id is returned
  }

  async sendLinkToUser(email, token) {
    try {
      const resetLink = `http://your-app.com/reset-password?token=${token}`;
      console.log(`Sending reset link to ${email}: ${resetLink}`);

      return { message: 'Password reset link sent successfully' };
    } catch (error) {
      console.error('Error in sendLinkToUser:', error);
      throw error;
    }
  }

  async createResetPasswordToken(id) {
    const user = await this.userRepository.getUserFromDb(id);
    if (!user) {
      throw new GraphQLError("User not found", { extensions: { code: "BAD_USER_INPUT" } });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return token;
  }

  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new GraphQLError("User not found", { extensions: { code: "BAD_USER_INPUT" } });
      }
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new GraphQLError("Error fetching user", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
  }

  async updateUser(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new GraphQLError("Error updating user", { extensions: { code: "SERVER_ERROR" } });
    }
  }

  async deleteUser(userId) {
    try {
      const result = await this.userRepository.findByIdAndDelete(userId);
      if (!result) {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new GraphQLError("Error deleting user", { extensions: { code: "SERVER_ERROR" } });
    }
  }

  async generateJwt(payload) {
    const jwtKey = process.env.JWT_SECRET || "default_secret";
    return jwt.sign(payload, jwtKey, { expiresIn: "1h" });
  }

  async updateUserProfile(userId, updateData) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, updateData, { new: true });
      if (!updatedUser) {
        throw new GraphQLError("User not found", { extensions: { code: "USER_NOT_FOUND" } });
      }
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new GraphQLError("Error updating user profile", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
  }

  async activateUserAccount(userId) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, { active: true }, { new: true });
      if (!updatedUser) {
        throw new GraphQLError("User not found", { extensions: { code: "USER_NOT_FOUND" } });
      }
      return {
        success: true,
        message: "User account activated successfully",
      };
    } catch (error) {
      console.error("Error activating user account:", error);
      throw new GraphQLError("Error activating user account", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
  }

  async generateResetToken(email) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new GraphQLError("User not found", { extensions: { code: "USER_NOT_FOUND" } });
    }

    const resetToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send reset email
    await this.sendResetPasswordEmail(email, resetToken);

    return {
      success: true,
      message: "Password reset link sent to email",
    };
  }

  async resetPassword(userId, newPassword) {
    const hashedPassword = await this.userRepository.hashPassword(newPassword);
    const updatedUser = await this.userRepository.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      throw new GraphQLError("Error updating password", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  }

  async deactivateUserAccount(userId) {
    try {
      const result = await this.userRepository.findByIdAndUpdate(userId, { active: false });
      if (!result) {
        throw new GraphQLError("User not found", { extensions: { code: "USER_NOT_FOUND" } });
      }
      return {
        success: true,
        message: "User account deactivated successfully",
      };
    } catch (error) {
      console.error("Error deactivating user account:", error);
      throw new GraphQLError("Error deactivating user account", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
  }
  async getUserByEmailFromDb(email) {
    const user = await this.userRepository.getUserById(id);
    if (!user) return null;
    return {
      _id: user._id.toString(),  // or id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      nickname: user.nickname,
      picture: user.picture,
      // add other necessary fields
    };
  }

  async updateUserRole(userId, role) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(userId, { role }, { new: true });
      if (!updatedUser) {
        throw new GraphQLError("User not found", { extensions: { code: "USER_NOT_FOUND" } });
      }
      return {
        success: true,
        message: `User role updated to ${role}`,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new GraphQLError("Error updating user role", { extensions: { code: "INTERNAL_SERVER_ERROR" } });
    }
  }

  async sendResetPasswordEmail(email, token) {
    // Implement sending email logic here
    // Example:
    const resetLink = `http://your-app.com/reset-password?token=${token}`;
    await sendEmail(email, "Reset Password", resetLink);
    console.log(`Password reset email sent to ${email}: ${resetLink}`);
    return { message: 'Password reset email sent successfully' };
  }
}

export default LocalAuthService;