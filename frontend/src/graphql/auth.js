import { gql } from '@apollo/client';

// 用户登录
export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      code
      success
      message
      auth {
        token
        userId
        role
      }
      refreshToken
      role
      userId
    }
  }
`;

// 用户注册
export const REGISTER_USER = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      code
      success
      message
      auth {
        token
        userId
        role
      }
      refreshToken
      role
      userId
    }
  }
`;

// 获取用户信息
export const GET_USER = gql`
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      fullName
      firstName
      lastName
      role
      picture
      nickname
      provider
      oauthId
      ... on Host {
        description
        inviteCode
      }
    }
  }
`;

// OAuth 用户保存
export const OAUTH_SAVE_USER = gql`
  mutation OAuthSaveUser($input: OAuthInput!) {
    oauthSaveUser(input: $input) {
      token
      userId
      role
    }
  }
`;

// 退出登录
export const LOGOUT = gql`
  mutation Logout($provider: OAuthProvider) {
    logout(provider: $provider)
  }
`;

// 验证 Google Token
export const VERIFY_GOOGLE_TOKEN = gql`
  mutation VerifyGoogleToken($token: String) {
    verifyGoogleToken(token: $token) {
      token
      userId
      role
    }
  }
`;