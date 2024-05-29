import { defaultFieldResolver } from "graphql";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError } from "graphql";
import fetch from "node-fetch";

const baseUrl = process.env.REST_API_BASE_URL;

function uniqueDirectiveTransformer(schema, directiveName) {
  return mapSchema(schema, {
    [MapperKind.INPUT_OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
      const uniqueDirective = getDirective(schema, fieldConfig, directiveName)?.[0];
      if (uniqueDirective) {
        const { path, key } = uniqueDirective;
        const fieldName = key ? key : fieldConfig.name;
        const objectType = typeName;

        const mutationsForInput = getMutationsForInput(schema, objectType);
        mutationsForInput.forEach(mutation => {
          const originalResolve = mutation.resolve || defaultFieldResolver;
          mutation.resolve = async (...args) => {
            const uniqueValue = args[1][fieldName];
            if (uniqueValue) {
              const response = await fetch(
                `${baseUrl}/${path}?${fieldName}=${uniqueValue}`
              );
              const results = await response.json();
              if (results.length) {
                throw new GraphQLError(message,{extensions:{code:`Value for ${fieldName} is already in use`}});
              }
            }
            return await originalResolve.apply(this, args);
          };
        });
      }
      return fieldConfig;
    }
  });
}

function getMutationsForInput(schema, objectType) {
  const mutations = [];
  const typeMap = schema.getTypeMap();
  Object.values(typeMap).forEach(type => {
    if (type.astNode && type.astNode.kind === 'ObjectTypeDefinition' && type.name === 'Mutation') {
      type.astNode.fields.forEach(field => {
        field.arguments.forEach(arg => {
          if (arg.type.kind === 'NamedType' && arg.type.name.value === objectType) {
            mutations.push({
              name: field.name.value,
              resolve: type.getFields()[field.name.value].resolve,
            });
          }
        });
      });
    }
  });
  return mutations;
}

// Define your type definitions and resolvers as usual
const typeDefs = `
  directive @unique(path: String!, key: String) on INPUT_FIELD_DEFINITION
  
  type Mutation {
    createUser(input: CreateUserInput!): User
  }
  
  input CreateUserInput {
    username: String! @unique(path: "users", key: "username")
  }
  
  type User {
    id: ID!
    username: String!
  }
`;

const resolvers = {
  Mutation: {
    createUser: async (parent, { input }, context, info) => {
      // Implement your mutation logic here
      return { id: "1", username: input.username };
    }
  }
};

// Create your executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
const schemaWithDirectives = uniqueDirectiveTransformer(schema, 'unique');
export default schemaWithDirectives;
