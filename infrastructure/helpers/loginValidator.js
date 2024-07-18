
import { GraphQLError } from 'graphql';


// Existing email and password validation function
const loginValidate = async (email, password) => {
  const errors = [];
  if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
    errors.push('Must be a valid email address');
  }
  if (!password || password.length < 8 || password.length > 88 || !/\d/.test(password)) {
    errors.push('Password must contain at least 8 characters and include a number');
  }

  if (errors.length > 0) {
    throw new GraphQLError(errors.join(', '), {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

// New password validation function
const passwordValidate = async (password) => {
  const errors = [];
  if (!password || password.length < 8 || password.length > 88 || !/\d/.test(password)) {
    errors.push('Password must contain at least 8 characters and include a number');
  }

  if (errors.length > 0) {
    throw new GraphQLError(errors.join(', '), {
      extensions: { code: 'BAD_USER_INPUT' }
    });
  }
};

export { loginValidate, passwordValidate };
