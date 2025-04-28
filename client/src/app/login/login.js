"use client"; // Ensure it's a client component

import { gql, useMutation } from "@apollo/client";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export default function Login() {
  const [login, { loading, error, data }] = useMutation(LOGIN);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = event.target.elements;
    try {
      const result = await login({
        variables: {
          email: email.value,
          password: password.value,
        },
      });
      console.log("Login successful:", result.data.login);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          Email:
          <input type="email" name="email" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          Password:
          <input type="password" name="password" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </label>
        <button 
          type="submit" 
          style={{ 
            padding: '0.5rem 1rem', 
            borderRadius: '4px', 
            border: 'none', 
            backgroundColor: '#007bff', 
            color: 'white', 
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Login
        </button>
      </form>
      {data && (
        <div>
          <h2>Welcome, {data.login.user.name}</h2>
          <p>Email: {data.login.user.email}</p>
        </div>
      )}
    </div>
  );
}
