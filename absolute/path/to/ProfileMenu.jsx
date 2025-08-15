'use client';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfileMenu() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
      >
        Join Now
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt="User avatar"
          width={24}
          height={24}
          className="rounded-full"
        />
      )}
      <span className="font-semibold">Hello, {session.user.name}</span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
      >
        Logout
      </button>
    </div>
  );
}
