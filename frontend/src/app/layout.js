'use client';

import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html lang="zh" className={GeistSans.variable}>
      <body className="bg-gray-900 text-white">
        <SessionProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}