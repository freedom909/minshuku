import React from 'react';
import { useMutation } from '@apollo/client';
import { GoogleLogin } from '@react-oauth/google';
import { OAUTH_LOGIN_MUTATION } from '../../graphql/auth';
import { useAuth } from '../../context/AuthContext';

export default function GoogleSignIn({ buttonText = "Continue with Google" }) {
  const { login } = useAuth();
  const [oauthLogin] = useMutation(OAUTH_LOGIN_MUTATION);

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await oauthLogin({ 
        variables: { 
          input: {
            provider: 'GOOGLE',
            token: credentialResponse.credential
          }
        }
      });
      
      if (data?.oauthLogin) {
        login(data.oauthLogin.token, data.oauthLogin.userId);
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <div className="google-signin">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={buttonText}
        shape="rectangular"
        size="large"
        width="300"
      />
    </div>
  );
}