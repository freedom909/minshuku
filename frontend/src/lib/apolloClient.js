import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
    link: new HttpLink({
        uri: "http://localhost:4010/graphql", // Your GraphQL backend
        credentials: "include", // Include cookies if authentication is needed
    }),
    cache: new InMemoryCache(),
});

export default client;
