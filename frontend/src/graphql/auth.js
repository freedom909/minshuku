import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      userId
      role
    }
  }
`;

export const OAUTH_LOGIN_MUTATION = gql`
  mutation OAuthLogin($input: OAuthUserInput!) {
    oauthLogin(input: $input) {
      token
      userId
      role
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      role
    }
  }
`;