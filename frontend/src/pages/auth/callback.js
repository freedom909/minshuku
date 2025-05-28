// pages/auth/callback.js (or /app/auth/callback/page.js if using App Router)

'use client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getSession } from 'next-auth/react'; // or wherever your session is from
import userService from '../services/userService'; // adjust path

export default function OAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const processOAuth = async () => {
      const session = await getSession();

      if (!session) {
        console.error("No session found.");
        return;
      }

      let provider = null;
      let token = null;

      // Detect provider and extract corresponding token
      if (session.user?.provider === 'google') {
        provider = 'google';
        token = session.id_token || session.accessToken;
      } else if (session.user?.provider === 'facebook') {
        provider = 'facebook';
        token = session.accessToken;
      } else if (session.user?.provider === 'apple') {
        provider = 'apple';
        token = session.id_token || session.accessToken;
      } else {
        console.error('Unknown or missing provider in session:', session);
        router.push('/auth/error');
        return;
      }

      try {
        const response = await userService.oauthLogin(provider, token);

        if (response?.success || response?.accessToken) {
          localStorage.setItem('jwt_token', response.accessToken || response.token);
          router.push('/dashboard');
        } else {
          console.error('OAuth backend failed:', response?.error || 'Unknown error');
          router.push('/auth/error');
        }
      } catch (err) {
        console.error('OAuth processing error:', err);
        router.push('/auth/error');
      }
    };

    processOAuth();
  }, [router]);

  return <p>Processing OAuth login...</p>;
}

