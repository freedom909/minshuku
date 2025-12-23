// subgraph-auth/auth/auth-directive.js
import {
  mapSchema,
  getDirective,
  MapperKind,
} from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import { requireAuth } from '../../services/auth/requireAuth.js';

export function authDirectiveTransformer(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const authDirective = getDirective(
        schema,
        fieldConfig,
        'auth'
      )?.[0];

      if (!authDirective) return fieldConfig;

      const { requires = [] } = authDirective;
      const originalResolve =
        fieldConfig.resolve || defaultFieldResolver;

      fieldConfig.resolve = async (parent, args, ctx, info) => {
        requireAuth(ctx, { requires });
        return originalResolve(parent, args, ctx, info);
      };

      return fieldConfig;
    },
  });
}
