// infrastructure/authz/applyAuthDirective.js
export function applyAuthDirective(resolvers) {
  for (const type in resolvers) {
    for (const field in resolvers[type]) {
      const r = resolvers[type][field];
      if (!r.__auth) continue;

      resolvers[type][field] = async (p, a, c, i) => {
        if (!c.user) throw new Error("UNAUTHENTICATED");

        const { roles, where } = r.__auth;

        if (roles && !roles.includes(c.user.role)) {
          throw new Error("FORBIDDEN");
        }

        if (where) {
          const fn = new Function("ctx", `with (ctx) { return ${where} }`);
          if (!fn({ user: c.user, args: a })) {
            throw new Error("FORBIDDEN");
          }
        }

        return r(p, a, c, i);
      };
    }
  }
}

export default applyAuthDirective;

//