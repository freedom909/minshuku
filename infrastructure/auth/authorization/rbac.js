// infrastructure/auth/authorization/rbac.js
import { forbidden } from "./errors.js";

export function checkRole(userRole, rule) {
  if (rule.any && !rule.any.includes(userRole)) {
    forbidden("Role not allowed");
  }

  if (rule.all && !rule.all.every(r => r === userRole)) {
    forbidden("Role requirement failed");
  }

  if (rule.not && rule.not.includes(userRole)) {
    forbidden("Role explicitly denied");
  }
}
