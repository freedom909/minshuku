import { gql, useLazyQuery } from '@apollo/client';
import { useState } from 'react';

const USER_EXISTS_QUERY = gql`
  query UserExists($email: String!) {
    userExists(email: $email)
  }
`;

export default function CheckUserForm() {
  const [email, setEmail] = useState('');
  const [checkUser, { data, loading, error }] = useLazyQuery(USER_EXISTS_QUERY);

  const handleSubmit = (e) => {
    e.preventDefault();
    checkUser({ variables: { email } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Check</button>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <p>User exists: {data.userExists ? 'Yes' : 'No'}</p>}
    </form>
  );
}
