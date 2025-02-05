"use client"; // Ensure it's a client component

import { gql, useQuery } from "@apollo/client";

const GET_USER = gql`
  query GetUser {
    me {
      id
      name
      email
    }
  }
`;

export default function Login() {
    const { loading, error, data } = useQuery(GET_USER);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1>Welcome, {data.me.name}</h1>
            <p>Email: {data.me.email}</p>
        </div>
    );
}
