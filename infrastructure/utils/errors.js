import { GraphQLError } from 'graphql';

class AuthenticationError extends GraphQLError {
  constructor(message) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

export { AuthenticationError, ForbiddenError };
