import GraphQLError from 'graphql';
import {loginValidate} from '../infrastructure/helpers/loginValidator.js';
import userService from '../infrastructure/services/userService.js';
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
  }
}

export default resolvers;