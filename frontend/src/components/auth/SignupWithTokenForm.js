import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';

const SIGNUP_WITH_TOKEN = gql`
  mutation SignupWithToken($token: String!) {
    signupWithToken(token: $token) {
      success
      message
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export default function SignupWithTokenForm() {
  const [token, setToken] = useState('');
  const [signup, { data, loading, error }] = useMutation(SIGNUP_WITH_TOKEN);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ variables: { token } });
    } catch (err) {
      console.error('Signup failed', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter signup token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button type="submit">Sign Up</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && (
        <p>
          {data.signupWithToken.success
            ? `Welcome, ${data.signupWithToken.user.name}!`
            : `Failed: ${data.signupWithToken.message}`}
        </p>
      )}
    </form>
  );
}
