'use client';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;

  if (!session) {
    window.location.href = '/login';
    return null;
  }

  const user = session.user;

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <img src={user.image} alt="User Avatar" />
      <p>Email: {user.email}</p>
    </div>
  );
}
