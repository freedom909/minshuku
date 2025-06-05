
import { GraphQLError } from 'graphql';

const registerValidate = async ({ name, nickname, picture,role }) => {
  const errors = [];
  if (!name || name.length < 2 || name.length > 18) {
    errors.push('Name must be between 2 and 18 characters');
  }
  if (!nickname) {
    errors.push('Nickname is required');
  }
  if (!role) {
    errors.push('Role is required');
  }

  if (errors.length > 0) {
    throw new GraphQLError(errors.join(', '), {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};


export default registerValidate