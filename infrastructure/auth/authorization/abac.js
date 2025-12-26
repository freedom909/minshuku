// infrastructure/auth/authorization/abac.js
import get from "lodash.get";
import { forbidden } from "./errors.js";

export function checkCondition(scope, condition) {
  const { user, result } = scope;

  if (condition.owner) {
    if (user.id !== result.userId) {
      forbidden("Not resource owner");
    }
  }

  if (condition.match) {
    for (const rule of condition.match) {
      const left = get(result, rule.field);
      const right = get(scope, rule.equals);

      if (left !== right) {
        forbidden("Attribute condition failed");
      }
    }
  }
}
