// GraphQL mutations for authentication
import { gql } from '@apollo/client';

export const SIGN_IN_WITH_GOOGLE = gql`
  mutation SignInWithGoogle($input: GoogleSignInInput!) {
    signInWithGoogle(input: $input) {
      success
      userId
      role
      code
    }
  }
`;

export const SIGN_IN_WITH_FACEBOOK = gql`
  mutation SignInWithFacebook($input: FacebookSignInInput!) {
    signInWithFacebook(input: $input) {
      success
      userId
      role
      code
    }
  }
`;

export const SIGN_IN_WITH_GITHUB = gql`
  mutation SignInWithGithub($input: GithubSignInInput!) {
    signInWithGithub(input: $input) {
      success
      userId
      role
      code
    }
  }
`;