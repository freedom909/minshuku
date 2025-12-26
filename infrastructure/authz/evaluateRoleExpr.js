export function evaluateRoleExpr(expr, userRole) {
  if (!expr) return true;

  if (expr.any) {
    return expr.any.includes(userRole);
  }

  if (expr.all) {
    return expr.all.every((r) => r === userRole);
  }

  if (expr.not) {
    return !evaluateRoleExpr(expr.not, userRole);
  }

  return false;
}
