export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.extensions = { code: 'UNAUTHENTICATED' };
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.extensions = { code: 'FORBIDDEN' };
  }
}


export default { AuthenticationError, ForbiddenError };
