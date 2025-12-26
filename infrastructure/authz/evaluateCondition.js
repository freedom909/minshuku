import { GraphQLError } from "graphql";

export async function evaluateCondition(condition, { parent, args, ctx }) {
  if (condition.owner) {
    const userId = ctx.user.id;

    // 常见模式：args.id / parent.userId
    const resourceOwnerId =
      parent?.userId || args?.userId || args?.id;

    if (!resourceOwnerId || resourceOwnerId !== userId) {
      throw new GraphQLError("FORBIDDEN (not owner)");
    }
  }
}
