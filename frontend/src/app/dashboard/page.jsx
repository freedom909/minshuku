'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { redirect } from 'next/navigation';


export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) redirect('/login');

  let imageSrc = session.user?.image || defaultAvatar;
  if (imageSrc && !imageSrc.startsWith('http')) {
    imageSrc = `https://${imageSrc}`;
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="dashboard-container">
      <div className="user-profile">
      <img src={session.user?.image} alt="User Avatar" />

       
        <div className="user-info">
          <h2>Welcome, {session.user?.name ||""}</h2>
          <p>Email: {session.user?.email ||""}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}
