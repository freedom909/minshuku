import { GraphQLError } from 'graphql';

const AuthenticationError = () => {
  const authErrMessage = '*** you must be logged in ***';
  return new GraphQLError(authErrMessage, {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  });
};

const ForbiddenError = (errMessage) => {
  return new GraphQLError(errMessage, {
    extensions: {
      code: 'FORBIDDEN',
    },
  });
};

 const handleGraphQLError = (message, code) => {
  throw new GraphQLError(message, {
    extensions: { code },
  });
};

export  { AuthenticationError, ForbiddenError, handleGraphQLError};
