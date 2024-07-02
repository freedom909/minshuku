// import { AuthenticationError } from '../../infrastructure/utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';

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
import { GraphQLError } from 'graphql';
import runValidations from '../infrastructure/helpers/runValidations.js';
import initializeService from '../infrastructure/services/initService.js';
import { loginValidate } from '../infrastructure/helpers/loginValidator.js';
import dotenv from 'dotenv';
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
      // initializeService();
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

  signIn: async (_, {input}, { dataSources }) => {    
    const { email, password } = input;
    await loginValidate(email, password);
    const { userService } = dataSources;
    const user=await userService.getUserByEmailFromDb(email);
    if (!user) {
      throw new GraphQLError("User not available", {
        extensions: { code: "BAD_USER_INPUT" },});
    }
    if (!passwordValidate(password)) {
      throw new GraphQLError("Invalid password", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    //  Find the user by email
   return userService.login({ email, password }); 
  },
  
   forgotPassword: async (_, { input:{email} }, { dataSources }) => {
     await loginValidate(email);
     const { userService } = dataSources;

  try {
    const user = await userService.getUserByEmailFromDb(email);
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

    await userService.sendLinkToUser(email, token);
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
    const user = await userService.getUserByEmailFromDb(email);
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

requestResetPassword:  async (_,{email}, { dataSources }) => {
  const {userService} =dataSources
  // Validate the email input (optional step)
  if (!email) {
    throw new GraphQLError("Email is required", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  // Retrieve the user by email from the database
  const user = await userService.getUserByEmailFromDb(email);
  if (!user) {
    throw new GraphQLError("User not found", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  const token = await createResetPasswordToken(user.id);
  await sendResetPasswordEmail(user.email, token);
  return {
    code: 200,
    success: true,
    message: "Password reset link sent successfully",
  };
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