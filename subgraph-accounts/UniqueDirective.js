import { ApolloServer } from '@apollo/server'; // Import from the new @apollo/server package
import cors from 'cors';
import express from 'express';

const baseUrl = process.env.REST_API_BASE_URL;

export default class UniqueDirective extends ApolloServer {
  visitInputFieldDefinition(field, { objectType }) {
    const { path, key } = this.args;
    const fieldName = key || field.name;

    const mutationsForInput = this.getMutations(({ args = [] }) => {
      return args.find(arg => arg?.type?.ofType === objectType);
    });

    mutationsForInput.forEach(mutation => {
      const { resolve = defaultFieldResolver } = mutation;
      mutation.resolve = async (...args) => {
        const uniqueValue = this.getMutationArgumentValue(fieldName, args[1]);

        if (uniqueValue) {
          const response = await fetch(`${baseUrl}/${path}?${fieldName}=${uniqueValue}`);
          const results = await response.json();

          if (results.length) {
            throw new UserInputError(`Value for ${fieldName} is already in use`);
          }
        }

        return await resolve.apply(this, args);
      };
    });
  }
}

// // Set up your Express app
// const app = express();
// app.use(cors());

// // Create an instance of ApolloServer
// const server = new UniqueDirective({
//   typeDefs, // Your GraphQL schema
//   resolvers, // Your GraphQL resolvers
// });

// // Apply the Apollo Server middleware to your Express app
// server.applyMiddleware({ app });

// Start your server
// app.listen({ port: 4000 }, () => {
//   console.log(`Server ready at http://localhost:4000${server.graphqlPath}`);
// });

// import express from 'express';
// import { ApolloServer } from '@apollo/server'; // Import from the new @apollo/server package
// import cors from 'cors'; // Add CORS middleware if needed

// // Your GraphQL schema and resolvers
// const typeDefs = /* ... */;
// const resolvers = /* ... */;

// // Create an instance of ApolloServer
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
// });

// // Set up your Express app
// const app = express();
// app.use(cors()); // Enable CORS if required

// // Apply the Apollo Server middleware to your Express app
// server.applyMiddleware({ app });

// // Start your server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
// });
