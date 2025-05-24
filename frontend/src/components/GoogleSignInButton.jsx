'use client';
import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 p-2 border rounded-md ${
          loading ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <Image
          src="/google.png"
          alt="Google logo"
          width={20}
          height={20}
        />
        <span className="text-gray-700 font-medium">
          {loading ? 'Signing in...' : 'Continue with Google'}
        </span>
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">
          {error}
        </p>
      )}
    </div>
  );
}