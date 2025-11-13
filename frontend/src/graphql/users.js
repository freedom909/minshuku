import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      fullName
      firstName
      lastName
      role
      status
      picture
      nickname
      provider
      oauthId
    }
  }
`;

export const LIST_USERS = gql`
  query ListUsers {
    users {
      id
      email
      role
      status
      nickname
    }
  }
`;