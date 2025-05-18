import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { json } from "express";

const client = new ApolloClient({
    link: new HttpLink({
        uri: "http://localhost:4010/graphql", // Your GraphQL backend
        credentials: "include", // Include cookies if authentication is needed
        middleware: [json()], // Add JSON middleware to parse request body
    }),
    cache: new JSON.parse(JSON.stringify(new InMemoryCache())),
});

export default client;
