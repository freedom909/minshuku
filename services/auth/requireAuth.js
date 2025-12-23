import { GraphQLError } from 'graphql';

export function requireAuth(ctx, options = {}) {
  if (!ctx.user) {
    throw new GraphQLError('UNAUTHENTICATED', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }

  if (options?.roles && !options.roles.includes(ctx.user.role ?? '')) {
    throw new GraphQLError('FORBIDDEN', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  return ctx.user;
}
