"use client";
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthTestPage() {
 const { user, loading, error } = useAuth();

  useEffect(() => {
    console.log("Auth test page loaded");
    console.log("User state:", user);
    console.log("Loading state:", loading);
    console.log("Error:", error);
  }, [user, loading, error]);

  return (
    <div className="p-6">
      <h1>Auth Test Page</h1>
      {loading ? (
        <p>Loading user...</p>
      ) : (
        <div>
          <p>User status: {user ? 'Authenticated' : 'Not authenticated'}</p>
          {user && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p><strong>User ID:</strong> {user.userId}</p>
              <p><strong>User Name:</strong> {user.name}</p>
              <p><strong>User Role:</strong> {user.role}</p>
            </div>
          )}
          {error && <p className="text-red-500 mt-4">Error: {error}</p>}
          <div className="mt-6">
            <Link href="/dashboard" className="text-blue-600 underline mr-4">
              Go to Dashboard
            </Link>
            <Link href="/" className="text-blue-600 underline">
              Go to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}