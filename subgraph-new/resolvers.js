import {GraphQLError} from 'graphql';
import {loginValidate} from '../infrastructure/helpers/loginValidator.js';
import { passwordValidate } from '../infrastructure/helpers/RegPassValidator.js';
import runValidations from '../infrastructure/helpers/runValidations.js';
import bcrypt from 'bcrypt';
const resolvers={
  Mutation:{
    signIn: async (_, {input:{ email, password  } }, { dataSources }) => { //"TypeError: Cannot read properties of undefined (reading 'email')"
      const {userService}=dataSources
      const user = await userService.getUserByEmailFromDb(email);
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }
      if (!loginValidate(email, password)) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "INVALID_LOGIN" },
        });
      }
      return await userService.login({ email, password });
    },

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
  


    updatePassword: async (_, {input}, { dataSources}) => { 
      const { userId, password, newPassword } = input;
    //retrieve the user from the db
    if (!userId) {
      return new GraphQLError("User ID is required", { extensions: { code: "USER_ID_REQUIRED" } });
    }
      
       const { userService } = dataSources;
       console.log('Received userId:', userId);
       console.log('Received input:', input);
        const user = await userService.findById(userId);// "message": "User not found",
        console.log('User retrieved from DB:', user);
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }
        //validate the password
     
       await passwordValidate(newPassword);//"Password must contain at least 8 characters and include a number",
       await passwordValidate(password);
      // validate the is matching
        const passwordMatch=bcrypt.compareSync(password, user.password);
        console.log('Password match result:', passwordMatch);
        if (!passwordMatch) {
            throw new GraphQLError("Invalid password", {
              extensions: { code: "INVALID_PASSWORD" },
            });
          }
          
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          const updatedUser = await userService.editPassword(userId, hashedNewPassword);
        console.log('User after password update:', updatedUser);
        return updatedUser;

      },
  }
}

export default resolvers;