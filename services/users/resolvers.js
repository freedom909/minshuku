import { AuthenticationError } from '../../infrastructure/utils/errors.js';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError } from 'graphql';

import { readFileSync } from 'fs';
import { validateInviteCode } from '../../infrastructure/helpers/validateInvitecode.js';
import DateTimeType from '../../infrastructure/scalar/DateTimeType.js';
import { authenticateJWT, checkPermissions } from '../../infrastructure/auth/auth.js';
import { permissions } from '../../infrastructure/auth/permission.js';
import UserService from './datasources/userService.js';
import UserRepository from '../../infrastructure/userRepository.js';
// import { connectToDatabase } from '../../infrastructure/DB/connectDB.js';
import { validLogin, validRegister } from '../../infrastructure/helpers/valid.js';
import dotenv from 'dotenv';
import runValidations from './runValidations.js';
import {connectToDatabase} from '../../infrastructure/DB/connectDB.js';
dotenv.config();


async function initializeServices() {
  const db = await connectToDatabase();
  const userService = new UserService(new UserRepository(db));
  return { userService };
}

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
      await runValidations({ email, password, name, nickname, role, inviteCode, picture });
      if (role === 'HOST') {
        const isValidInviteCode = await validateInviteCode(inviteCode);
        if (!isValidInviteCode) {
          throw new UserInputError('Invalid invite code', {
            extensions: { code: 'BAD_USER_INPUT' }
          });
        }
        const {userService } = await initializeServices()
        return dataSources.userService.register({ email, password, name, nickname, role: 'HOST', picture });
      } else {
        const {userService } = await initializeServices()
        return dataSources.userService.register({ email, password, name, nickname, role: 'GUEST', picture });
      }
    },
  },

    logout: async (_, __, { dataSources }) => {
      return await dataSources.userService.logout();
    },
    signIn: async (_, { input: { email, password } }, { dataSources }) => {
      if (validLogin(email, password)) {
        return await dataSources.userService.login({ email, password });
      }
      throw new GraphQLError("Email and password must be provided", {
        extensions: { code: "EMAIL_PASSWORD_REQUIRED" },
      });
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
    // updatePassword: async (
    //   _,
    //   { input: { id, newPassword, password } },
    //   { dataSources }
    // ) => {
    //   const user = await dataSources.userService.getUserFromDb(id);
    //   if (!user) {
    //     throw new GraphQLError("User not found", {
    //       extensions: { code: "BAD_USER_INPUT" },
    //     });
    //   }
    //   const isValidPassword = await validatePassword(password, user.password);
    //   if (!isValidPassword) {
    //     throw new GraphQLError("Invalid password", {
    //       extensions: { code: "BAD_USER_INPUT" },
    //     });
    //   }
    //   return await dataSources.userService.updatePassword(id, newPassword);
    // },
    // requestResetPassword: async (_, { email }, { dataSources }) => {
    //   const user = await dataSources.userService.getUserByEmailFromDb(email);
    //   if (!user) {
    //     throw new GraphQLError("User not found", {
    //       extensions: { code: "BAD_USER_INPUT" },
    //     });
    //   }
    //   const token = await createResetPasswordToken(user.id);
    //   await sendResetPasswordEmail(user.email, token);
    //   return {
    //     code: 200,
    //     success: true,
    //     message: "Reset password email sent successfully!",
    //   };
    // },
  
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
