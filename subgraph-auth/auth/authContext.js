// subgraph-auth/auth/auth-context.js
export function getUserFromContext(ctx) {
  return ctx.user || null;
}
