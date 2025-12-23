import { GraphQLError } from "graphql";

export function applyAuthDirective(resolvers) {
  for (const typeName of Object.keys(resolvers)) {
    const type = resolvers[typeName];

    for (const fieldName of Object.keys(type)) {
      const resolver = type[fieldName];

      if (!resolver?.__auth) continue;

      const rule = resolver.__auth;

      type[fieldName] = async (parent, args, context, info) => {
        const user = context.user;

        if (!user) {
          throw new GraphQLError("Not authenticated", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        const role = user.role;

        // all
        if (rule.all && !rule.all.every((r) => role === r)) {
          throw forbidden();
        }

        // any
        if (rule.any && !rule.any.includes(role)) {
          throw forbidden();
        }

        // not
        if (rule.not && rule.not.includes(role)) {
          throw forbidden();
        }

        return resolver(parent, args, context, info);
      };
    }
  }
}

function forbidden() {
  return new GraphQLError("Forbidden", {
    extensions: { code: "FORBIDDEN" },
  });
}

export default applyAuthDirective;