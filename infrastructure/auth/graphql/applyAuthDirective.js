import { GraphQLError } from "graphql";
import get from "lodash.get";

export function applyAuthDirective(resolvers) {
  for (const typeName of Object.keys(resolvers)) {
    const type = resolvers[typeName];

    for (const fieldName of Object.keys(type)) {
      const resolver = type[fieldName];
      if (!resolver?.__auth) continue;

      type[fieldName] = wrapResolver(resolver, resolver.__auth);
    }
  }
}

function wrapResolver(resolver, rule) {
  return async (parent, args, ctx, info) => {
    const user = ctx.user;
    if (!user) unauthenticated();

    // 1️⃣ RBAC
    if (rule.role) {
      checkRole(user.role, rule.role);
    }

    // 2️⃣ 执行 resolver（先拿 resource）
    const result = await resolver(parent, args, ctx, info);

    // 3️⃣ ABAC
    if (rule.condition) {
      checkCondition({ user, result, ctx }, rule.condition);
    }

    return result;
  };
}

export default applyAuthDirective;