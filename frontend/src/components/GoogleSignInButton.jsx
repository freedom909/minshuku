// frontend/src/components/auth/GoogleSignInButton.jsx
import { useMutation } from '@apollo/client';
import { GOOGLE_SIGN_IN } from '../../graphql/auth';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

export default function GoogleSignInButton() {
  const [googleSignIn] = useMutation(GOOGLE_SIGN_IN);
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const { data } = await googleSignIn({
        variables: {
          input: {
            provider: 'GOOGLE',
            token: credentialResponse.credential
          }
        }
      });

      if (data.signIn.success) {
        login(data.signIn.auth.token, data.signIn.auth.userId, {
          email: data.signIn.auth.email,
          name: data.signIn.auth.name,
          picture: data.signIn.auth.picture
        });
      }
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.error('Google Login failed')}
      useOneTap
      auto_select
      theme="filled_blue"
      size="large"
      width="300"
    />
  );
}