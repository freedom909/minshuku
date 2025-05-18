import { gql } from '@apollo/client';

export const GOOGLE_SIGN_IN = gql`
  mutation GoogleSignIn($input: SignInInput!) {
    signIn(input: $input) {
      code
      success
      message
      auth {
        token
        userId
        role
      }
      role
      userId
    }
  }
`;