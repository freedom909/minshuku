'use client';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;

  if (!session) {
    window.location.href = '/login';
    return null;
  }
 const handleLogout = () => {
    signOut(); // This function is provided by next-auth/react
  };
  const user = session.user;
  <Image
  src={session.user.image || '/google.png'}
  alt="User Avatar"
  width={100}
  height={80}
/>
  return (
    <div>
      <div>
      <p>Signed in as {session.user.email}</p>

      <p>Signed in as {session.user.name}</p>
      <button onClick={handleLogout}>Logout</button>
      <Image
          src={session.user.image || '/google.png'} // Ensure the path is correct
          alt="User Avatar"
          width={100}
          height={80}
        />
    </div>
    </div>
  );
}