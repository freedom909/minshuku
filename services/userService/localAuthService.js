//services/userService/localAuthService.js

import mongoose from "mongoose";
import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import TokenService from "./tokenService.js";

dotenv.config();

/**
 * Local authentication service class.
 * @class LocalAuthService
 * @param {Object} dependencies - Dependencies for the service.
 * @param {Object} dependencies.userRepository - User repository.
 * @param {Object} dependencies.logger - Logger instance.
 * @param {Object} dependencies.passwordHasher - Password hashing utility.
 */
class LocalAuthService {
  constructor({
    userRepository,
    logger,
    passwordHasher,
    tokenService,
    accountLockService,
  }) {
    this.baseURL = "http://localhost:4000/";
    if (!userRepository) {
      throw new Error("UserRepository not provided to UserService");
    }
    this.userRepository = userRepository;
    this.logger = logger;
    this.passwordHasher = passwordHasher;
    this.tokenService = tokenService;
    this.accountLockService = accountLockService;
  }

 // ... existing code ...
async localLogin(email, password) {
  console.log("Starting local login process for email:", email);

  try {
    // 检查账户是否存在
    const userExisting = await this.userRepository.getUserByEmailFromDb(email);
    if (!userExisting) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }
    // 检查账户是否被锁定
    if (this.accountLockService) {
      const isLocked = await this.accountLockService.isAccountLocked(email);
      if (isLocked) {
        const retryAfter = await this.accountLockService.getLockTimeRemaining(
          email
        );
        throw new GraphQLError(
          "Account temporarily locked due to too many failed attempts",
          {
            extensions: {
              code: "ACCOUNT_LOCKED",
              retryAfter,
            },
          }
        );
      }
    }

    // 尝试登录
    console.log("Attempting local login for email:", email);
    const user = await this.login(email, password);

    // 登录成功后清除失败尝试记录
    if (this.accountLockService) {
      await this.accountLockService.clearAttempts(email);
    }

    // 生成访问令牌和刷新令牌
    console.log("Generating tokens for user:", user._id.toString());
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateToken(user),
      this.tokenService.generateRefreshToken(user),
    ]);

    console.log("Local login successful for user:", user._id.toString());
    return {
      code: 200,
      success: true,
      message: "Login successful",
      token: accessToken,
      refreshToken,
      userId: user._id?.toString() || user._id,
      role: user.role || "GUEST",
      user: {
        id: user._id?.toString?.() || user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        picture: user.picture,
      }
    };
  } catch (error) {
    console.error("Local login error:", error);

    // 记录失败尝试
    if (this.accountLockService && error.extensions?.code !== "ACCOUNT_LOCKED") {
      await this.accountLockService.recordAttempt(email);
    }

    // 检查是否达到锁定阈值
    if (this.accountLockService && error.extensions?.code === "INVALID_CREDENTIALS") {
      const attempts = await this.accountLockService.getAttemptCount(email);
      if (attempts >= this.accountLockService.MAX_ATTEMPTS) {
        await this.accountLockService.lockAccount(email);
        throw new GraphQLError(
          "Account temporarily locked due to too many failed attempts",
          {
            extensions: {
              code: "ACCOUNT_LOCKED",
              retryAfter: this.accountLockService.LOCK_DURATION / 1000,
            },
          }
        );
      }
    }

    if (error instanceof GraphQLError) {
      throw error;
    }

    throw new GraphQLError("Authentication failed", {
      extensions: {
        code: "AUTHENTICATION_FAILED",
        error: error.message,
      },
    });
  }
}
// ... existing code ...
  async login(email, password) {
    console.log("Starting login process for email:", email);

    const user = await this.userRepository.getUserByEmailFromDb(email);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }
    const isMatch = await this.passwordHasher.compare(password, user.password);
    if (!isMatch) {
      throw new GraphQLError("Invalid credentials", {
        extensions: { code: "INVALID_CREDENTIALS" },
      });
    };
    await this.accountLockService.recordAttempt(user.userId);
    return user;
  }

  async register(email, password, name, nickname, role, picture) {
    
    const existingUser = await this.userRepository.getUserByEmailFromDb(email);
    if (existingUser) {
      throw new Error(
        "❌ Email already exists. Cannot create duplicate accounts."
      );
      return
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserInfo = {
      email,
      password: hashedPassword,
      name,
      nickname,
      role,
      picture,
      provider: "local",
      sub: new mongoose.Types.ObjectId().toString(),
  
    };

    // Make sure insertUser returns the correct format
    const newUser = await this.userRepository.insertUser(newUserInfo);

    if (!newUser || !newUser._id) {
      throw new Error(
        "❌ Registration failed: No _id returned from insertUser."
      );
    }
    const token=await this.tokenService.generateToken(newUser);
    const refreshToken = await this.tokenService.generateRefreshToken(newUser);
    newUser.token=token;
    newUser.refreshToken=refreshToken;
    this.logger.info(`Registering user: ${email}`);
    console.log("User registered successfully:", newUser);
    return {
      code: 200,
      success: true,
      message: "Registration successful",
      user:newUser,
      
      refreshToken:refreshToken,
      role: newUser.role||"GUEST",
      userId: newUser._id?.toString?.() || newUser.id,
    };
    
  }
  async sendLinkToUser(email, token) {
    try {
      const resetLink = `http://your-app.com/reset-password?token=${token}`;
      console.log(`Sending reset link to ${email}: ${resetLink}`);

      return { message: "Password reset link sent successfully" };
    } catch (error) {
      console.error("Error in sendLinkToUser:", error);
      throw error;
    }
  }

  async createResetPasswordToken(id) {
    const user = await this.userRepository.getUserFromDb(id);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return token;
  }

  async getUserById(id) {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new GraphQLError("Error fetching user", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  async handleSignUpError(error) {
    console.error("Error during signUp:", error);

    if (error instanceof GraphQLError) throw error;

    if (
      error.message.includes("duplicate") &&
      error.message.includes("email")
    ) {
      throw new GraphQLError("Email already registered", {
        extensions: { code: "DUPLICATE_EMAIL" },
      });
    }

    throw new GraphQLError("Registration failed: " + error.message, {
      extensions: { code: "REGISTRATION_FAILED", error: error.message },
    });
  }
  async updateUser(userId, newPassword) {
    const hashedPassword = await this.passwordHasher.hash(password);
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(
        userId,
        { password: hashedPassword },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new GraphQLError("Error updating user", {
        extensions: { code: "SERVER_ERROR" },
      });
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
      throw new GraphQLError("Error deleting user", {
        extensions: { code: "SERVER_ERROR" },
      });
    }
  }

  async generateJwt(payload) {
    const jwtKey = process.env.JWT_SECRET || "minshuku_jwt_secret_key_2024_secure_random_string";
    return jwt.sign(payload, jwtKey, { expiresIn: "1h" });
  }

  async updateUserProfile(userId, updateData) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      );
      if (!updatedUser) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      return updatedUser;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new GraphQLError("Error updating user profile", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  async activateUserAccount(userId) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(
        userId,
        { active: true },
        { new: true }
      );
      if (!updatedUser) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      return {
        success: true,
        message: "User account activated successfully",
      };
    } catch (error) {
      console.error("Error activating user account:", error);
      throw new GraphQLError("Error activating user account", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  async generateResetToken(email) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "USER_NOT_FOUND" },
      });
    }

    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
      throw new GraphQLError("Error updating password", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }

    return {
      success: true,
      message: "Password updated successfully",
    };
  }

  async deactivateUserAccount(userId) {
    try {
      const result = await this.userRepository.findByIdAndUpdate(userId, {
        active: false,
      });
      if (!result) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      return {
        success: true,
        message: "User account deactivated successfully",
      };
    } catch (error) {
      console.error("Error deactivating user account:", error);
      throw new GraphQLError("Error deactivating user account", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  async updateUserRole(userId, role) {
    try {
      const updatedUser = await this.userRepository.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
      );
      if (!updatedUser) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      return {
        success: true,
        message: `User role updated to ${role}`,
        user: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      throw new GraphQLError("Error updating user role", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
  }

  async sendResetPasswordEmail(email, token) {
    // Implement sending email logic here
    // Example:
    const resetLink = `http://your-app.com/reset-password?token=${token}`;
    await sendEmail(email, "Reset Password", resetLink);
    console.log(`Password reset email sent to ${email}: ${resetLink}`);
    return { message: "Password reset email sent successfully" };
  }
}

export default LocalAuthService;
