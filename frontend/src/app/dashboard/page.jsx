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
    signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="dashboard-container">
      <div className="user-profile">
        {session.user?.image && (
          <Image
            src={session.user.image.startsWith('http') ? session.user.image : `https://${session.user.image}`}
            alt="User Avatar"
            width={100}
            height={100}
            className="user-avatar"
            priority
            onError={(e) => {
              e.currentTarget.src = '/default-avatar.png';
            }}
          />
        )}
        <div className="user-info">
          <h2>Welcome, {session.user?.name}</h2>
          <p>Email: {session.user?.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
      </div>
    </div>
  );
}