// import { AuthenticationError } from '../../infrastructure/utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';
import bcrypt from 'bcrypt';
import { readFileSync } from 'fs';
import { validateInviteCode } from '../infrastructure/helpers/validateInvitecode.js';
import DateTimeType from '../infrastructure/scalar/DateTimeType.js';
import { authenticateJWT, checkPermissions } from '../infrastructure/middleware/auth.js';
import { permissions } from '../infrastructure/auth/permission.js';
import UserService from '../infrastructure/services/userService.js';
import { passwordValidate } from '../infrastructure/helpers/RegPassValidator.js';
import UserRepository from '../infrastructure/repositories/userRepository.js';
// import { connectToDatabase } from '../infrastructure/DB/connectDB.js';
import { validRegister } from '../infrastructure/utils/valid.js';
import dotenv from 'dotenv';
import runValidations from './runValidations.js';
import initializeService from '../infrastructure/services/initService.js';

dotenv.config();

const resolvers = {
  DateTime: DateTimeType,
  Query: {
    user: async (_, { id }, { dataSources }) => {
      const user = await dataSources.userService.getUserFromDb(id);
      if (!user) {
        throw new GraphQLError("No user found", {
          extensions: { code: "NO_USER_FOUND" },
        });
      }
      return user;
    },
    getUserByEmail: async (_, { email }, { dataSources }) => {
      return dataSources.userService.getUserByEmailFromDb(email);
    },
    me: async (_, __, { dataSources, userId }) => {
      if (!userId) {
        throw new GraphQLError("User not authenticated", {
          extensions: { code: ApolloServerErrorCode.BAD_REQUEST_ERROR },
        });
      }
      const user = await dataSources.userService.getUserFromDb(userId);
      return user;
    },
  },
  Mutation: {
    signUp: async (_, { input }, { dataSources }) => {
      const { email, password, name, nickname, role, inviteCode, picture } = input;
      console.log('Received input:', input);  // Add this line for debugging
      // Run validations
      await runValidations(input);

      // Additional role validation
      if (role !== 'GUEST' && role !== 'HOST') {
        throw new GraphQLError('Invalid role', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new GraphQLError('Invalid invite code', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
      }
      initializeService();
      // Ensure dataSources.userService is available
      const { userService } = dataSources;
      console.log('dataSources');  // Add this line for debugging
      if (!userService) {
        throw new GraphQLError('UserService not available', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' }
        });
      }

      return userService.register({ email, password, name, nickname, role, picture });
    },
  },

  signIn: async (_, { input}, { dataSources }) => {
    const { email, password } = input;
    initializeService();
    // Ensure dataSources.userService is available
    const { userService } = dataSources;
    console.log('dataSources');  // Add this line for debugging
    //  Find the user by email
   return userService.login({ email, password }); 
  },
  
forgotPassword: async (_, { input:{email} }, { dataSources }) => {
  await loginValidate(email);

  try {
    const user = await dataSources.userService.getUserByEmailFromDb(email);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
   
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    await dataSources.userService.sendLinkToUser(email, token);
    // Return the token and user info
    return {
      code: 200,
      success: true,
      message: "Password reset link sent successfully",
    };
  } catch (error) {

    console.error('Error in forgetPassword resolver:', error);
  }
},

  logout: async (_, __, { dataSources }) => {
    return await dataSources.userService.logout();
  },

  sendInviteCode: async (_, { email }, { dataSources }) => {
    const user = await dataSources.userService.getUserByEmailFromDb(email);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    const inviteCode = await validateInviteCode(user.invite_code);
    if (!inviteCode) {
      throw new GraphQLError("Invalid invite code", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return {
      code: 200,
      success: true,
      message: "Invite code sent successfully!",
      user: user,
    };
  },

  updatePassword: async (_, { input: { userId, newPassword, password } }, { dataSources }) => {
    // Fetch user from database
    const user = await dataSources.userService.getUserFromDb(userId);
    if (!user) {
      throw new GraphQLError("User not found", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    console.log('User retrieved:', user);
    console.log('Provided password:', password);
    console.log('Stored password hash:', user.password);
    // Validate the current password
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isValidPassword);
    if (!isValidPassword) {
      throw new GraphQLError("Invalid password", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    console.log('Password validation successful');

    // Validate the new password
    if (!newPassword || newPassword.length < 8 || !/\d/.test(newPassword)) {
      return {
        code: 400,
        success: false,
        message: "New password must contain at least 8 characters and include a number",
        userId: null,
        role: null,
        token: null,
      };
    }
    console.log('New password validation successful');

    // Hash the new password
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hashed:', hashedNewPassword);
    // Update the password
    const updatedUser = await dataSources.userService.updatePassword(userId, newPassword);

    // Ensure updatedUser is not null
    if (!updatedUser || !updatedUser._id) {
      console.error('Updated user is null or missing properties', updatedUser);
      throw new GraphQLError("Failed to update password", {
        extensions: { code: "INTERNAL_SERVER_ERROR" },
      });
    }
    console.log('Updated user:', updatedUser);
    try {
      // Generate JWT token
      const payload = { id: updatedUser._id.toString() };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      console.log('JWT token generated:', token);
      // Return the token and user info
      return {
        code: 200,
        success: true,
        message: "Password updated successfully",
        userId: updatedUser._id.toString(),
        role: updatedUser.role,
        token,
      };
    } catch (error) {
      console.error('Error in updatePassword resolver:', error);
      throw new GraphQLError('An error occurred while updating the password', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  },

  User: {
    __resolveType(user) {
      if (user.role === "HOST") {
        return "Host";
      } else if (user.role === "GUEST") {
        return "Guest";
      }
      return null;
    },
  },
  Host: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.userService.getUserFromDb(user.id);
    },
  },
  Guest: {
    __resolveReference: (user, { dataSources }) => {
      return dataSources.userService.getUserFromDb(user.id);
    },
  },
};

export default resolvers;