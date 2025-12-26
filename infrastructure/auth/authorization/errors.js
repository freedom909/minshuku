// infrastructure/auth/authorization/errors.js
import { GraphQLError } from "graphql";

export function forbidden(message = "Forbidden") {
  throw new GraphQLError(message, {
    extensions: { code: "FORBIDDEN" },
  });
}

export function unauthenticated() {
  throw new GraphQLError("Unauthenticated", {
    extensions: { code: "UNAUTHENTICATED" },
  });
}
