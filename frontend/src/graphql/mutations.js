// graphql/mutations.js
import { gql } from '@apollo/client';

export const SAVE_OAUTH_USER = gql`
  mutation SaveOAuthUser($input: OAuthUserInput!) {
    saveOAuthUser(input: $input) {
      success
      message
      user {
        id
        email
        name
        picture
        role
      }
    }
  }
`;
