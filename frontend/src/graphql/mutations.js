//frontend/src/ graphql/mutations.js
import { gql } from '@apollo/client';

export const SAVE_OAUTH_USER = gql`
  mutation SaveOAuthUser($input: OAuthUserInput!) { // Define the mutation with input wrong?
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
